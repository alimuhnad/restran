angular.module('main').factory('User', function ($q) {

  var User = Parse.User.extend({
    isExpired: function (date) {
      return new Date() > date;
    }
  }, {

      new: function () {
        return new User();
      },

      getInstance: function () {
        return this;
      },

      all: function (params) {

        var defer = $q.defer();

        Parse.Cloud.run('getUsers', params, {
          success: function (result) {
            defer.resolve(result);
          },
          error: function (error) {
            defer.reject(error);
          }
        });

        return defer.promise;

      },

      count: function (params) {

        var defer = $q.defer();

        var query = new Parse.Query(this);

        if (params && params.accountType) {
          query.containedIn('accountType', params.accountType);
        }

        query.count().then(function (count) {
          defer.resolve(count);
        }, function (error) {
          defer.reject(error);
        });

        return defer.promise;
      },

      create: function (data) {

        console.log(data);
        var defer = $q.defer();

        Parse.Cloud.run('createUser', data, {
          success: function (result) {
            defer.resolve(result);
          },
          error: function (error) {
            defer.reject(error);
          }

        });

        return defer.promise;

      },

      save: function (user) {

        var defer = $q.defer();

        var data = user.toJSON();

        Parse.Cloud.run('saveUser', {
          data: data
        }, {
            success: function (result) {
              defer.resolve(result);
            },
            error: function (error) {
              defer.reject(error);
            }
          });
        return defer.promise;
      },

      update: function (user) {

        var data = {
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
          password: user.password,
          photo: user.photo,
          accountType: user.accountType,
          phone: user.phone
        }

        var defer = $q.defer();

        Parse.Cloud.run('updateUser', data, {
          success: function (result) {
            defer.resolve(result);
          },
          error: function (error) {
            defer.reject(error);
          }
        });

        return defer.promise;
      },

      delete: function (data) {

        var defer = $q.defer();

        Parse.Cloud.run('destroyUser', data, {
          success: function (response) {
            defer.resolve(response);
          },
          error: function (error) {
            defer.reject(error);
          }
        });

        return defer.promise;
      },

      fetch: function () {
        var defer = $q.defer();

        Parse.User.current().fetch().then(function (user) {
          defer.resolve(user);
        }, function (error) {
          defer.reject(error);
        });

        return defer.promise;
      }

    });

  Object.defineProperty(User.prototype, 'name', {
    get: function () {
      return this.get('name');
    },
    set: function (val) {
      this.set('name', val);
    }
  });

  Object.defineProperty(User.prototype, 'username', {
    get: function () {
      return this.get('username');
    },
    set: function (val) {
      this.set('username', val);
    }
  });

  Object.defineProperty(User.prototype, 'email', {
    get: function () {
      return this.get('email');
    },
    set: function (val) {
      this.set('email', val);
    }
  });

  Object.defineProperty(User.prototype, 'password', {
    get: function () {
      return this.get('password');
    },
    set: function (val) {
      this.set('password', val);
    }
  });

  Object.defineProperty(User.prototype, 'photo', {
    get: function () {
      return this.get('photo');
    },
    set: function (val) {
      this.set('photo', val);
    }
  });

  Object.defineProperty(User.prototype, 'photoThumb', {
    get: function () {
      return this.get('photoThumb');
    },
    set: function (val) {
      this.set('photoThumb', val);
    }
  });

  Object.defineProperty(User.prototype, 'accountType', {
    get: function () {
      return this.get('accountType');
    },
    set: function (val) {
      this.set('accountType', val);
    }
  });

  Object.defineProperty(User.prototype, 'isActive', {
    get: function () {
      return this.get('isActive');
    },
    set: function (val) {
      this.set('isActive', val);
    }
  });

  Object.defineProperty(User.prototype, 'phone', {
    get: function () {
      return this.get('phone');
    },
    set: function (val) {
      this.set('phone', val);
    }
  });

  return User;

});