var Image = require('../helpers/image');
var moment = require('moment');

Number.prototype.pad = function (len) {
  return (new Array(len + 1).join("0") + this).slice(-len);
}

function saveImage(base64) {
  var parseFile = new Parse.File('image.jpg', {
    base64: base64
  });
  return parseFile.save();
}

function isAdmin(user) {

  var promise = new Parse.Promise();

  var query = new Parse.Query(Parse.Role);
  query.equalTo('name', 'Admin');
  query.equalTo('users', user);
  query.first().then(function (adminRole) {

    if (adminRole) {
      promise.resolve(true);
    } else {
      promise.reject(new Parse.Error(1, 'Not Admin'));
    }

  }, function () {
    promise.reject(new Parse.Error(1, 'Unexpected database error'));
  });

  return promise;

}

function isAdminOrMerchant(user) {

  var promise = new Parse.Promise();

  var query = new Parse.Query(Parse.Role);
  query.containedIn('name', ['Admin', 'Merchant']);
  query.equalTo('users', user);
  query.first().then(function (role) {
    if (role) {
      promise.resolve(true);
    } else {
      promise.reject('Not Admin or Merchant');
    }
  }, function () {
    promise.reject('Unexpected database error');
  });

  return promise;

}

Parse.Cloud.beforeSave(Parse.User, function (req, res) {

  var obj = req.object;
  var user = req.user;

  if (!obj.existed()) {
    var acl = new Parse.ACL();
    acl.setPublicReadAccess(true);
    acl.setPublicWriteAccess(false);
    obj.setACL(acl);
    obj.set('isActive', true);

    if (!obj.get('accountType')) {
      obj.set('accountType', ['User']);
    }

    if (!obj.get('isSuperAdmin')) {
      obj.set('isSuperAdmin', false);
    }
  }

  if (!req.master && obj.existed() && obj.dirty('accountType')) {
    return res.error('Account Type cannot be changed');
  }

  if (obj.dirty('firstName') || obj.dirty('lastName') || obj.dirty('username')) {

    var canonical = '';
    canonical += obj.get('firstName') ? obj.get('firstName').toLowerCase() + ' ' : '';
    canonical += obj.get('lastName') ? obj.get('lastName').toLowerCase() + ' ' : '';
    canonical += obj.get('username') ? obj.get('username').toLowerCase() + ' ' : '';
    obj.set('canonical', canonical);
  }

  if (req.master) {
    return res.success();
  }

  if (!obj.get('photo') || !obj.dirty('photo')) {
    return res.success();
  }

  var imageUrl = obj.get('photo').url();

  Image.resize(imageUrl, 160, 160).then(function (base64) {
    return saveImage(base64);
  }).then(function (savedFile) {
    obj.set('photo', savedFile);
    res.success();
  }, function (error) {
    res.error(error.message);
  });
});

Parse.Cloud.afterSave(Parse.User, function (req) {

  var user = req.object;

  var query = new Parse.Query(Parse.Role);
  query.equalTo('users', user);
  query.find({ useMasterKey: true }).then(function (roles) {

    var promises = [];

    for (var i = 0; i < roles.length; i++) {
      roles[i].getUsers().remove(user);
      promises.push(roles[i].save(null, { useMasterKey: true }));
    }

    return Parse.Promise.when(promises);

  }).then(function () {

    var userQuery = new Parse.Query(Parse.User);
    return userQuery.get(user.id, { useMasterKey: true });

  }).then(function (objUser) {

    var query1 = new Parse.Query(Parse.Role);
    query1.containedIn('name', objUser.get('accountType'));
    return query1.find();

  }).then(function (roles1) {

    for (var i = 0; i < roles1.length; i++) {
      roles1[i].getUsers().add(user);
      roles1[i].save(null, {
        useMasterKey: true
      });
    }
  });

});

Parse.Cloud.define('saveUser', function (req, res) {

  var data = req.params.data;
  var user = req.user;

  if (!user) {
    return res.error('Not Authorized');
  }

  isAdmin(user).then(function (adminRole) {

    if (data.objectId) {

      var query = new Parse.Query(Parse.User);
      query.equalTo('objectId', data.objectId);
      query.first({
        useMasterKey: true
      }).then(function (user1) {

        for (var key in data) {
          var val = data[key];

          // create clean pointer data to avoid Parse Object is not valid error.

          if (key !== 'ACL' && key !== 'sessionToken') {
            user1.set(key, val);
          }
        }

        user1.save(null, {
          useMasterKey: true
        }).then(function (success) {
          res.success(success);
        }, function (error) {
          res.error(error.message);
        });

      }, function (error) {
        res.error(error.message);
      });

    } else {


      var objUser = new Parse.User();
      var acl = new Parse.ACL();
      acl.setPublicReadAccess(false);
      acl.setPublicWriteAccess(false);
      objUser.setACL(acl);

      objUser.save(data, {
        useMasterKey: true
      }).then(function (success) {
        res.success(success);
      }, function (error) {
        res.error(error.message);
      });
    }
  }, function (error) {
    res.error(error.message);
  });

});

Parse.Cloud.define('updateUser', function (req, res) {

  var data = req.params;
  var user = req.user;

  var query = new Parse.Query(Parse.Role);
  query.equalTo('name', 'Admin');
  query.equalTo('users', user);
  query.first().then(function (adminRole) {

    if (!adminRole) {
      return res.error('Not Authorized');
    }

    var query = new Parse.Query(Parse.User);
    query.equalTo('objectId', data.id);
    return query.first({
      useMasterKey: true
    });
  }).then(function (objUser) {

    objUser.set('name', data.name);
    objUser.set('username', data.email);
    objUser.set('email', data.email);
    objUser.set('photo', data.photo);

    if (!data.password) {
      objUser.set('password', data.password);
    }

    return objUser.save(null, {
      useMasterKey: true
    });
  }).then(function (success) {
    res.success(success);
  }, function (error) {
    res.error(error);
  });
});

Parse.Cloud.define('destroyUser', function (req, res) {

  var user = req.user;

  var query = new Parse.Query(Parse.Role);
  query.equalTo('name', 'Admin');
  query.equalTo('users', user);
  query.first().then(function (adminRole) {

    if (!adminRole) {
      return res.error('Not Authorized');
    }

    var query = new Parse.Query(Parse.User);
    query.equalTo('objectId', req.params.id);
    return query.first({
      useMasterKey: true
    });
  }).then(function (objUser) {

    if (!objUser) {
      return res.error('User not found');
    }

    return objUser.destroy({
      useMasterKey: true
    });
  }).then(function (success) {
    res.success(success);
  }, function (error) {
    res.error(error);
  });
});

Parse.Cloud.define('getUsers', function (req, res) {

  var params = req.params;
  var user = req.user;

  isAdmin(user).then(function () {

    var query = new Parse.Query(Parse.User);

    if (params && params.search) {
      query.contains('canonical', params.search.toLowerCase());
    }

    if (params && params.firstName) {
      query.equalTo('firstName', params.firstName);
    }

    if (params && params.lastName) {
      query.equalTo('lastName', params.lastName);
    }

    if (params && params.accountType) {
      query.containedIn('accountType', params.accountType);
    }

    if (params && params.status && params.status !== 'All') {
      if (Array.isArray(params.status)) {
        query.containedIn('status', params.status);
      } else {
        query.equalTo('status', params.status);
      }
    }

    if (params && params.id) {
      query.equalTo('objectId', params.id);
    }

    if (params && params.limit && params.page) {
      query.limit(params.limit);
      query.skip((params.page * params.limit) - params.limit);
    }

    if (params && params.orderby == "asc") {
      query.ascending(params.orderbytable);
    } else if (params && params.orderby == "desc") {
      query.descending(params.orderbytable);
    } else {
      query.descending('createdAt');
    }

    query.equalTo('isSuperAdmin', false);

    var queryUsers = query.find({
      useMasterKey: true
    });
    var queryCount = query.count({
      useMasterKey: true
    });

    return Parse.Promise.when(queryUsers, queryCount);

  }).then(function (users, total) {
    res.success({
      users: users,
      total: total
    });
  }, function (error) {
    res.error(error.message);
  });
});

Parse.Cloud.beforeSave('ItemCategory', function (req, res) {

  var obj = req.object;
  var user = req.user;

  if (!user) {
    return res.error('Not Authorized');
  }

  if (!obj.get('restaurant').length) {
    obj.set('restaurant', null);
  }

  res.success();
});

Parse.Cloud.beforeSave('CustomerAddress', function (req, res) {

  var obj = req.object;
  var user = req.user;

  if (!user) {
    return res.error('Not Authorized');
  }

  obj.set('customer', user);

  res.success();
});

Parse.Cloud.beforeSave('Restaurant', function (req, res) {

  var obj = req.object;
  var user = req.user;

  if (!user) {
    return res.error('Not Authorized');
  }

  /*

  if (!obj.existed()) {
    obj.set('folio', obj.get('folio').toUpperCase());
  }

  if (obj.existed() && obj.dirty('folio')) {
    return res.error('Folio value cannot be edited');
  }
    */

  res.success();
});

Parse.Cloud.beforeSave('Cart', function (req, res) {

  var obj = req.object;
  var user = req.user;

  if (!user) {
    return res.error('Not Authorized');
  }

  if (!obj.existed() && !obj.get('restaurant')) {
    return res.error('Invalid data');
  }

  console.log('hola', obj.get('items').length);

  if (obj.existed() && obj.get('items').length === 0) {
    obj.set('restaurant', null);
    return res.success();
  }

  if (!obj.existed()) {
    obj.set('customer', user);
    return res.success();
  } else {

    var query = new Parse.Query('Cart');
    query.get(obj.id).then(function (cart) {

      if (cart.get('restaurant') && (cart.get('restaurant').id !== obj.get('restaurant').id)) {
        return res.error(3000, 'Cart can only contains items from single branch. Please clear your cart first.');
      }

      res.success();

    }, function (err) {
      res.error(err.message);
    });
  }
});

Parse.Cloud.beforeSave('Order', function (req, res) {

  var obj = req.object;
  var user = req.user;

  if (obj.existed()) {
    return res.success();
  }

  if (!user) {
    return res.error(1000, 'Not Authorized');
  }

  obj.set('customer', user);
  obj.set('statusOrder', 'Pending');

  var query = new Parse.Query('Order');

  query.equalTo('restaurant', obj.get('restaurant'));
  query.greaterThan('numberOrder', 0);
  query.descending('createdAt');
  query.first({
    success: function (getOrder) {

      var getNumberOrder = 0;
      if (getOrder == undefined) {
        getNumberOrder = 1000
      } else {
        getNumberOrder = (getOrder.get('numberOrder')) + 1;
      }
      obj.set('numberOrder', getNumberOrder);

      if (obj.get('orderType') === 'Pickup') {

        var promises = [
          obj.get('restaurant').fetch(),
          user.fetch()
        ];

        Parse.Promise.when(promises).then(function (results) {
          var objRestaurant = results[0];
          var objUser = results[1];

          if (objUser.get('isActive') === false) {
            return res.error(1002, 'Your account has been blocked.');
          }

          //obj.set('folio', obj.get('restaurant').get('folio') + '-' + obj.get('numberOrder'));

          res.success();

        }, function (error) {
          res.error(error.message);
        });

      } else {

        var promises = [
          obj.get('restaurant').fetch(),
          obj.get('shipping').zone.fetch(),
          user.fetch()
        ];

        Parse.Promise.when(promises).then(function (results) {
          var restaurant = results[0];
          var zone = results[1];
          var objUser = results[2];

          if (objUser.get('isActive') === false) {
            return res.error(1002, 'Your account has been blocked.');
          }

          //obj.set('folio', obj.get('restaurant').get('folio') + '-' + obj.get('numberOrder'));

          var isZoneAllowed = false;

          var len = restaurant.get('deliveryZone').length;
          for (var i = 0; i < len; i++) {
            var zone = restaurant.get('deliveryZone')[i];
            if (obj.get('zone').id === zone.id) {
              isZoneAllowed = true;
            }
          }

          if (isZoneAllowed === false) {
            res.error(1001, 'Sorry, this item can\'t be shipped to your selected address.');
          } else {
            res.success();
          }
        }, function (error) {
          res.error(error.message);
        });
      }
    }
  })
});

Parse.Cloud.afterSave('Order', function (req) {

  var obj = req.object;

  if (!obj.existed()) {

    var data = [];

    for (var i = 0; i < obj.get('items').length; i++) {
      var item = obj.get('items')[i];
      data.push({
        item: item.quantity + ' x ' + item.name,
        description: item.description,
        price: item.amount
      });
    }

    obj.get('restaurant').fetch(function (restaurant) {

      var email = {
        body: {
          title: 'A new order #' + obj.get('numberOrder') + ' has been placed',
          table: {
            data: data,
            columns: {
              // Optionally, customize the column widths
              customWidth: {
                item: '20%',
                price: '15%'
              },
              // Optionally, change column text alignment
              customAlignment: {
                price: 'right'
              }
            }
          },
          action: {
            instructions: 'Please click here to view it:',
            button: {
              text: 'Go to Dashboard',
              link: serverRootUrl + '/dashboard/orders'
            }
          },
          outro: ''
        }
      };

      mailgunHelper.send({
        to: restaurant.get('emailNotificationsAddress'),
        html: mailGenerator.generate(email),
        subject: 'New order #' + obj.get('numberOrder') + ' from ' + appName + ' for ' + obj.get('total')
      });

    });

  }

  if (obj.existed() && (obj.get('statusOrder') === 'Accepted' || obj.get('statusOrder') === 'Rejected')) {

    // Send notification to customer
    var pushQuery = new Parse.Query(Parse.Installation);
    pushQuery.equalTo('user', obj.get('customer'));

    var statusText = obj.get('statusOrder') === 'Accepted' ? 'تم القبول' : 'تم الرفض';

    var paramsPush = {
      where: pushQuery,
      data: {
        alert: obj.get('numberOrder') + 'طلبكم رقم #' + statusText,
        event: 'order',
        orderId: obj.id,
        orderNumber: obj.get('numberOrder'),
        status: obj.get('statusOrder'),
        reason: obj.get('reason'),
        sound: 'default'
      }
    };

    Parse.Push.send(paramsPush, { useMasterKey: true }).then(function () {
      console.log('push sent');
    }, function (error) {
      console.log('Error push', error);
    });
  }

  var query = new Parse.Query('Cart');
  query.equalTo('customer', req.user);
  query.first().then(function (cart) {
    if (cart) {
      cart.destroy();
    }
  });
});

Parse.Cloud.afterSave('Post', function (req) {

  if (!req.object.existed()) {
    var params = {
      where: new Parse.Query(Parse.Installation),
      data: {
        alert: req.object.get('title') + ': ' + req.object.get('body'),
        event: 'post',
        postId: req.object.id,
        sound: 'default'
      }
    };

    Parse.Push.send(params, { useMasterKey: true }).then(function () {
      console.log('push sent');
    }, function (error) {
      console.log('Error push', error);
    });
  }

});