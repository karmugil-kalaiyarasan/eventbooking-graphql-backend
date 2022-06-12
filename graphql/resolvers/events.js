const Event = require("../../models/event");
const User = require("../../models/user");

const { tranformEvent } = require("./merge");

module.exports = {
  events: async () => {
    try {
      const events = await Event.find();
      // .populate("creator") //method by mongoose to populate any relation it knows by passing the database field as an argument

      return events.map((event) => {
        //we are overwriting the doc value and the event.id value for every event object available under the events array of object.
        return tranformEvent(event);
      });
    } catch (err) {
      console.log(err);
    }
  },
  createEvent: async (args, req) => {
    // const event = {
    //   _id: Math.random().toString(),
    //   title: args.eventInput.title,
    //   description: args.eventInput.description,
    //   price: +args.eventInput.price,
    //   date: args.eventInput.date,
    // };

    if (!req.isAuth) {
      throw new Error("Unauthorized!");
    }

    const event = new Event({
      title: args.eventInput.title,
      description: args.eventInput.description,
      price: +args.eventInput.price,
      date: new Date(args.eventInput.date),
      creator: req.userId, //mongoose will automatically convert this string into an objectId
    });
    let createdEvent;
    try {
      const result = await event.save();
      createdEvent = tranformEvent(result);
      const creator = await User.findById(req.userId);
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
};
