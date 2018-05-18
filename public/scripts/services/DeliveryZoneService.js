angular.module('main').factory('DeliveryZone', function ($q) {

    var DeliveryZone = Parse.Object.extend('DeliveryZone', {

    }, {

            new() {
                return new DeliveryZone();
            },

            all: function (params) {

                var defer = $q.defer();
                var query = new Parse.Query(this);

                if (params && params.search) {
                    query.contains('canonical', params.search);
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

                // query.include(["restaurant"]);

                query.find().then(function (deliveryZone) {
                    defer.resolve(deliveryZone);
                }, function (error) {
                    defer.reject(error);
                })

                return defer.promise;

            },

            search: function (params) {

                var defer = $q.defer();
                var query = new Parse.Query(this);

                if (params && params.search) {
                    query.contains('canonical', params.search);
                }

                if (params && params.restaurant) {
                    query.contains('restaurant', params.restaurant);
                }

                if (params && params.isActive) {
                    query.equalTo('isActive', params.isActive);
                }

                query.find().then(function (deliveryZone) {
                    defer.resolve(deliveryZone);
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

                query.count().then(function (deliveryZone) {
                    defer.resolve(deliveryZone);
                }, function (error) {
                    defer.reject(error);
                })

                return defer.promise;

            },

            save: function (deliveryZone) {

                var defer = $q.defer();

                deliveryZone.save().then(function (obj) {
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

    Object.defineProperty(DeliveryZone.prototype, 'objectId', {
        get: function () {
            return this.get('objectId');
        },
        set: function (val) {
            this.set('objectId', val);
        }
    });

    Object.defineProperty(DeliveryZone.prototype, 'name', {
        get: function () {
            return this.get('name');
        },
        set: function (val) {
            this.set('name', val);
        }
    });

    Object.defineProperty(DeliveryZone.prototype, 'description', {
        get: function () {
            return this.get('description');
        },
        set: function (val) {
            this.set('description', val);
        }
    });

    Object.defineProperty(DeliveryZone.prototype, 'fee', {
        get: function () {
            return this.get('fee');
        },
        set: function (val) {
            this.set('fee', val);
        }
    });

    Object.defineProperty(DeliveryZone.prototype, 'restaurant', {
        get: function () {
            return this.get('restaurant');
        },
        set: function (val) {
            this.set('restaurant', val);
        }
    });

    Object.defineProperty(DeliveryZone.prototype, 'canonical', {
        get: function () {
            return this.get('canonical');
        },
        set: function (val) {
            this.set('canonical', val);
        }
    });

    Object.defineProperty(DeliveryZone.prototype, 'isActive', {
        get: function () {
            return this.get('isActive');
        },
        set: function (val) {
            this.set('isActive', val);
        }
    });

    return DeliveryZone;

});