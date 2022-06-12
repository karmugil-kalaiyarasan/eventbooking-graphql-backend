const Event = require("../../models/event");
const User = require("../../models/user");
const { dateToString } = require("../../helper/date");

// the functions events and user is created inorder to avoid the infinite loop that may occur in mongodb while we use the inbuild populate() method which keeps drilling the user followed by its event followed by its user followed by its events and so on. In order to avoid it we created this functions which will be triggered only if the user query for their events and will not follow its user unless it has been called again by user and so on.

const events = async (eventIds) => {
  //function to fetch multiple events
  try {
    const events = await Event.find({ _id: { $in: eventIds } });
    return events.map((event) => {
      return tranformEvent(event);
    });
    //   return events;
  } catch (err) {
    throw err;
  } //$in is a mongoose way of saying to find ids in the range of available id values.
};

const singleEvent = async (eventId) => {
  //function to fetch single event
  try {
    const event = await Event.findById(eventId);
    return tranformEvent(event);
  } catch (err) {
    throw err;
  }
};

const user = async (userId) => {
  //function for users under event
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

const tranformEvent = (event) => {
  //a generic function to create event object. it was created to reduce re-using the same code in multiple places.
  return {
    ...event._doc,
    _id: event.id,
    date: dateToString(event._doc.date),
    creator: user.bind(this, event._doc.creator), //calls the user funtion available above and returns the value of the function
  }; //converting mongoose id type to string using buildin mongoose property called .id
};

const transformBooking = (booking) => {
  //a generic function to create booking object. it was created to reduce re-using the same code in multiple places.
  return {
    ...booking._doc,
    _id: booking.id,
    user: user.bind(this, booking._doc.user),
    event: singleEvent.bind(this, booking._doc.event),
    createdAt: dateToString(booking._doc.createdAt),
    updatedAt: dateToString(booking._doc.updatedAt),
  };
};

exports.tranformEvent = tranformEvent;
exports.transformBooking = transformBooking;

// exports.user = user;
// exports.events = events;
// exports.singleEvent = singleEvent;
