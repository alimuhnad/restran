angular.module('main').factory('Restaurant', function ($q) {

  var Restaurant = Parse.Object.extend('Restaurant', {

  }, {

      new() {
        return new Restaurant();
      },

      all: function (params) {

        var defer = $q.defer();
        var query = new Parse.Query(this);

        if (params && params.search) {
          query.contains('canonical', params.search);
        }

        if (params && params.hasMenu) {
          query.equalTo('hasMenu', params.hasMenu);
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

        query.include(['deliveryZone']);


        query.find().then(function (restaurant) {
          defer.resolve(restaurant);
        }, function (error) {
          defer.reject(error);
        })

        return defer.promise;

      },

      searchAutocomplete: function (params) {

        var defer = $q.defer();
        var query = new Parse.Query(this);

        if (params && params.search) {
          query.contains('canonical', params.search);
          query.equalTo("isActive", true);
        }

        query.find().then(function (restaurant) {
          defer.resolve(restaurant);
        }, function (error) {
          defer.reject(error);
        })

        return defer.promise;

      },

      count: function (params) {

        var defer = $q.defer();
        var query = new Parse.Query(this);

        if (params && params.search) {
          query.contains('canonical', params.search);
        }

        query.count().then(function (restaurant) {
          defer.resolve(restaurant);
        }, function (error) {
          defer.reject(error);
        })

        return defer.promise;

      },

      save: function (restaurant) {

        var defer = $q.defer();

        restaurant.save().then(function (obj) {
          defer.resolve(obj);
        }, function (error) {
          defer.reject(error);
        });

        return defer.promise;

      },
      delete: function (obj) {

        var defer = $q.defer();
        obj.destroy().then(function (sucess) {
          defer.resolve(sucess);
        }, function (error) {
          defer.reject(error);
        });

        return defer.promise;

      }

    });

  Object.defineProperty(Restaurant.prototype, 'objectId', {
    get: function () {
      return this.get('objectId');
    },
    set: function (val) {
      this.set('objectId', val);
    }
  });

  Object.defineProperty(Restaurant.prototype, 'name', {
    get: function () {
      return this.get('name');
    },
    set: function (val) {
      this.set('name', val);
    }
  });

  Object.defineProperty(Restaurant.prototype, 'phones', {
    get: function () {
      return this.get('phones');
    },
    set: function (val) {
      this.set('phones', val);
    }
  });

  Object.defineProperty(Restaurant.prototype, 'address', {
    get: function () {
      return this.get('address');
    },
    set: function (val) {
      this.set('address', val);
    }
  });

  Object.defineProperty(Restaurant.prototype, 'minimumOrderAmount', {
    get: function () {
      return this.get('minimumOrderAmount');
    },
    set: function (val) {
      this.set('minimumOrderAmount', val);
    }
  });

  Object.defineProperty(Restaurant.prototype, 'orderDiscount', {
    get: function () {
      return this.get('orderDiscount');
    },
    set: function (val) {
      this.set('orderDiscount', val);
    }
  });

  Object.defineProperty(Restaurant.prototype, 'printerId', {
    get: function () {
      return this.get('printerId');
    },
    set: function (val) {
      this.set('printerId', val);
    }
  });

  Object.defineProperty(Restaurant.prototype, 'photo', {
    get: function () {
      return this.get('photo');
    },
    set: function (val) {
      this.set('photo', val);
    }
  });

  Object.defineProperty(Restaurant.prototype, 'location', {
    get: function () {
      return this.get('location');
    },
    set: function (val) {
      this.set('location', val);
    }
  });

  Object.defineProperty(Restaurant.prototype, 'deliveryZone', {
    get: function () {
      return this.get('deliveryZone');
    },
    set: function (val) {
      this.set('deliveryZone', val);
    }
  });

  Object.defineProperty(Restaurant.prototype, 'openingHours', {
    get: function () {
      return this.get('openingHours');
    },
    set: function (val) {
      this.set('openingHours', val);
    }
  });

  Object.defineProperty(Restaurant.prototype, 'isActive', {
    get: function () {
      return this.get('isActive');
    },
    set: function (val) {
      this.set('isActive', val);
    }
  });

  Object.defineProperty(Restaurant.prototype, 'hasMenu', {
    get: function () {
      return this.get('hasMenu');
    },
    set: function (val) {
      this.set('hasMenu', val);
    }
  });

  /*

  Object.defineProperty(Restaurant.prototype, 'folio', {
    get: function () {
      return this.get('folio');
    },
    set: function (val) {
      this.set('folio', val);
    }
  });

  */

  Object.defineProperty(Restaurant.prototype, 'timeZone', {
    get: function () {
      return this.get('timeZone');
    },
    set: function (val) {
      this.set('timeZone', val);
    }
  });

  Object.defineProperty(Restaurant.prototype, 'hourZone', {
    get: function () {
      return this.get('hourZone');
    },
    set: function (val) {
      this.set('hourZone', val);
    }
  });

  Object.defineProperty(Restaurant.prototype, 'emailNotificationsAddress', {
    get: function () {
      return this.get('emailNotificationsAddress');
    },
    set: function (val) {
      this.set('emailNotificationsAddress', val);
    }
  });



  Object.defineProperty(Restaurant.prototype, 'canonical', {
    get: function () {
      return this.get('canonical');
    },
    set: function (val) {
      this.set('canonical', val);
    }
  });

  return Restaurant;

});