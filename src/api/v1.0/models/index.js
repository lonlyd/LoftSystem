const User = require('./schemas/user');
const News = require('./schemas/news');
const helper = require('../helpers/serialize');
require('./connection.js');


module.exports.getUserByName = async function (userName) {
    return User.findOne({ userName });
}

module.exports.getUserById = async function (id) {
    return User.findById({ _id: id });
}

module.exports.getUsers = async function () {
    return User.find();
}

module.exports.createUser = async function (data) {
    const { username, surName, firstName, middleName, password } = data;
    const newUser = new User({
        userName: username,
        surName,
        firstName,
        middleName,
        image:
            'https://loftschool-node.herokuapp.com/assets/img/no-user-image-big.png',
        permission: {
            chat: { C: true, R: true, U: true, D: true },
            news: { C: true, R: true, U: true, D: true },
            settings: { C: true, R: true, U: true, D: true },
        },
    });
    newUser.setPassword(password);
    const user = await newUser.save();
    console.log(user);
    return user;
}

module.exports.updateUserPermission = async function (id, data) {
    return await User.findByIdAndUpdate(
        { _id: id },
        { $set: data },
        { new: true },
    )
}

module.exports.deleteUser = async function (id) {
    return User.findByIdAndRemove({ _id: id });
}

module.exports.updateUserProfile = async function (id, data) {
    return await User.findByIdAndUpdate(
        { _id: id },
        { $set: data },
        { new: true },
    );
}

module.exports.getNews = async function () {
    const news = await News.find();
    return news.map((news) => helper.serializeNews(news));
}

module.exports.createNews = async function (data, user) {
    const { title, text } = data;
    const news = new News({
        title,
        text,
        created_at: new Date(),
        user,
    });
    return await news.save();
}

module.exports.updateNews = async function (id, data) {
    return await News.findByIdAndUpdate(
        { _id: id },
        { $set: data });
}

module.exports.deleteNews = async function (id) {
    return News.findByIdAndRemove({ _id: id });
} 