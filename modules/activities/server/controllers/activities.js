var mongoose = require('mongoose');
var Activity = mongoose.model('Activity');

module.exports = function(System) {
  var obj = {};
  var json = System.plugins.JSON;
  var event = System.plugins.event;
  ['like', 'unlike', 'comment', 'newpost'].map(function(action) {
    event.on(action, function(data) {
      var post = data.post;
      var actor = data.actor;
      console.log(post.content, 'has been liked by', actor.name);
      obj.create(action, actor, post);
    });
  });
  
  /**
   * Create a new activity
   * @param  {Object} req Request
   * @param  {Object} res Response
   * @return {Void}
   */
  obj.create = function(action, actor, post) {
    var activity = new Activity({
      actor: actor,
      post: post,
      action: action
    });
    activity.save(function(err) {
      if (err) {
        return err;
      }
      return activity;
    });
  };

  /**
   * Get activities for a user
   * @param  {Object} req The request object
   * @param  {Object} res The response object
   * @return {Void}
   */
  obj.feed = function(req, res) {
    //TODO: pagination
    var userId = req.params.userId;
    var criteria = { actor: userId };
    Activity.find(criteria, null, {sort: {created: -1}}).populate('actor').populate('post').exec(function(err, posts) {
      if (err) {
        json.unhappy(err, res);
      } else {
        json.happy({
          records: posts
        }, res);
      }
    });
  };

  return obj;
};