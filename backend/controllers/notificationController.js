const NotificationSubscriber = require("../models/NotificationSubscriber");
const { sendExpiryEmail } = require("../utils/emailService");

exports.subscribeAndSend = async (req, res, next) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    if (!email.endsWith("@gmail.com")) {
      const error = new Error("Please provide a valid Gmail address.");
      error.statusCode = 400;
      throw error;
    }
    await NotificationSubscriber.findOneAndUpdate(
      { email },
      { email, active: true },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    const itemCount = await sendExpiryEmail(email);
    await NotificationSubscriber.updateOne({ email }, { lastSentAt: new Date() });
    res.json({ message: `Expiry report sent to ${email}.`, itemCount });
  } catch (err) {
    next(err);
  }
};

exports.subscribe = async (req, res, next) => {
  try {
    const email = String(req.body.email || "").trim().toLowerCase();
    if (!email.endsWith("@gmail.com")) {
      const error = new Error("Please provide a valid Gmail address.");
      error.statusCode = 400;
      throw error;
    }
    await NotificationSubscriber.findOneAndUpdate(
      { email },
      { email, active: true },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    res.json({ message: `Expiry reminders enabled for ${email}.` });
  } catch (err) {
    next(err);
  }
};