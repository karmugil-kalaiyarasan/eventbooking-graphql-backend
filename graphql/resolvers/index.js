const bcrypt = require("bcryptjs");
const Event = require("../../models/event");
const User = require("../../models/user");

// the functions events and user is created inorder to avoid the infinite loop that may occur in mongodb while we use the inbuild populate() method which keeps drilling the user followed by its event followed by its user followed by its events and so on. In order to avoid it we created this functions which will be triggered only if the user query for their events and will not follow its user unless it has been called again by user and so on.

const events = async (eventIds) => {
  try {
    const events = await Event.find({ _id: { $in: eventIds } });
    return events.map((event) => {
      return {
        ...event._doc,
        id: event.id,
        date: new Date(event._doc.date).toISOString(),
        creator: user.bind(this, event._doc.creator),
      };
    });
    //   return events;
  } catch (err) {
    throw err;
  } //$in is a mongoose way of saying to find ids in the range of available id values.
};

const user = async (userId) => {
  //user function is created to return the user object with userfields along with the createdEvents fields by binding them together
  try {
    const user = await User.findById(userId);

    return {
      ...user._doc,
      _id: user.id,
      createdEvents: events.bind(this, user._doc.createEvents),
    };
  } catch (err) {
    throw err;
  }
};

module.exports = {
  events: async () => {
    try {
      const events = await Event.find();
      // .populate("creator") //method by mongoose to populate any relation it knows by passing the database field as an argument

      return events.map((event) => {
        //we are overwriting the doc value and the event.id value for every event object available under the events array of object.
        return {
          ...event._doc,
          _id: event.id,
          date: new Date(event._doc.date).toISOString(),
          creator: user.bind(this, event._doc.creator), //calls the user funtion available above and returns the value of the function
        }; //converting mongoose id type to string using buildin mongoose property called .id
      });
    } catch (err) {
      console.log(err);
    }
  },
  createEvent: async (args) => {
    // const event = {
    //   _id: Math.random().toString(),
    //   title: args.eventInput.title,
    //   description: args.eventInput.description,
    //   price: +args.eventInput.price,
    //   date: args.eventInput.date,
    // };

    const event = new Event({
      title: args.eventInput.title,
      description: args.eventInput.description,
      price: +args.eventInput.price,
      date: new Date(args.eventInput.date),
      creator: "62a52cad34a99593c0258e48", //mongoose will automatically convert this string into an objectId
    });
    let createdEvent;
    try {
      const result = await event.save();
      createdEvent = {
        ...result._doc,
        _id: result._doc._id.toString(),
        date: new Date(event._doc.date).toISOString(),
        creator: user.bind(this, result._doc.creator),
      }; // converting mongoose id type to string manually
      const creator = await User.findById("62a52cad34a99593c0258e48");
      // console.log(result);

      if (!creator) {
        throw new Error("User does not exist");
      }
      creator.createEvents.push(event);
      await creator.save();

      //return { ...result._doc, _id: result._doc._id.toString() }; // converting mongoose id type to string manually
      return createdEvent;
    } catch (err) {
      console.log(err);
      throw err;
    }
  },
  createUser: async (args) => {
    try {
      const existingUser = await User.findOne({ email: args.userInput.email });
      if (existingUser) {
        throw new Error("User already exists!");
      }
      const hashedPassword = await bcrypt.hash(args.userInput.password, 12);

      const user = new User({
        email: args.userInput.email,
        password: hashedPassword,
      });
      const result = await user.save();

      return { ...result._doc, password: null, _id: result.id };
    } catch (err) {
      throw err;
    }
  },
};
