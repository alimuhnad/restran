angular.module('main').factory('ItemCategory', function ($q) {

    var ItemCategory = Parse.Object.extend('ItemCategory', {

    }, {

            new() {
                return new ItemCategory();
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


                query.find().then(function (itemCategory) {
                    defer.resolve(itemCategory);
                }, function (error) {
                    defer.reject(error);
                })

                return defer.promise;

            },

            search: function (params) {

                var defer = $q.defer();
                var query = new Parse.Query(this);

                query.equalTo('isActive', true);

                query.find().then(function (itemCategory) {
                    defer.resolve(itemCategory);
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

                query.find().then(function (itemCategory) {
                    defer.resolve(itemCategory);
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

                query.count().then(function (itemCategory) {
                    defer.resolve(itemCategory);
                }, function (error) {
                    defer.reject(error);
                })

                return defer.promise;

            },

            save: function (itemCategory) {

                var defer = $q.defer();

                itemCategory.save().then(function (obj) {
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

    Object.defineProperty(ItemCategory.prototype, 'objectId', {
        get: function () {
            return this.get('objectId');
        },
        set: function (val) {
            this.set('objectId', val);
        }
    });

    Object.defineProperty(ItemCategory.prototype, 'name', {
        get: function () {
            return this.get('name');
        },
        set: function (val) {
            this.set('name', val);
        }
    });

    Object.defineProperty(ItemCategory.prototype, 'canonical', {
        get: function () {
            return this.get('canonical');
        },
        set: function (val) {
            this.set('canonical', val);
        }
    });

    Object.defineProperty(ItemCategory.prototype, 'restaurant', {
        get: function () {
            return this.get('restaurant');
        },
        set: function (val) {
            this.set('restaurant', val);
        }
    });

    Object.defineProperty(ItemCategory.prototype, 'isActive', {
        get: function () {
            return this.get('isActive');
        },
        set: function (val) {
            this.set('isActive', val);
        }
    });

    return ItemCategory;

});