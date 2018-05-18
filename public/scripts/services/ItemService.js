angular.module('main').factory('Item', function ($q) {

    var Item = Parse.Object.extend('Item', {

    }, {

            new() {
                return new Item();
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

                query.include("itemCategory");
                // query.include("restaurant");

                query.find().then(function (item) {
                    defer.resolve(item);
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
                }

                if (params && params.restaurant) {
                    query.contains('restaurant', params.restaurant);
                }

                query.equalTo('isActive', true);

                query.find().then(function (item) {
                    defer.resolve(item);
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

                query.count().then(function (item) {
                    defer.resolve(item);
                }, function (error) {
                    defer.reject(error);
                })

                return defer.promise;

            },
            save: function (item) {

                var defer = $q.defer();

                item.save().then(function (obj) {
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

            },
            saveAll: function (items) {

                var defer = $q.defer();

                Parse.Object.saveAll(items, {
                    success: function (sucess) {
                        defer.resolve(sucess);
                    }, error: function (error) {
                        defer.resolve(error);
                    }
                });

                return defer.promise;
            },

            import: function (file) {
                var defer = $q.defer();

                var upload = Upload.upload({
                    url: '/upload',
                    data: { file: file }
                });

                upload.then(function (resp) {
                    defer.resolve(success);
                    console.log('file ' + resp.config.data.file.name + 'is uploaded successfully. Response: ' + resp.data);
                }, function (resp) {
                    defer.reject(resp);
                });


                return defer.promise;

            }

        });


    Object.defineProperty(Item.prototype, 'objectId', {
        get: function () {
            return this.get('objectId');
        },
        set: function (val) {
            this.set('objectId', val);
        }
    });

    Object.defineProperty(Item.prototype, 'itemId', {
        get: function () {
            return this.get('itemId');
        },
        set: function (val) {
            this.set('itemId', val);
        }
    });

    Object.defineProperty(Item.prototype, 'name', {
        get: function () {
            return this.get('name');
        },
        set: function (val) {
            this.set('name', val);
        }
    });

    Object.defineProperty(Item.prototype, 'description', {
        get: function () {
            return this.get('description');
        },
        set: function (val) {
            this.set('description', val);
        }
    });

    Object.defineProperty(Item.prototype, 'price', {
        get: function () {
            return this.get('price');
        },
        set: function (val) {
            this.set('price', val);
        }
    });

    Object.defineProperty(Item.prototype, 'discountedPrice', {
        get: function () {
            return this.get('discountedPrice');
        },
        set: function (val) {
            this.set('discountedPrice', val);
        }
    });

    Object.defineProperty(Item.prototype, 'photo', {
        get: function () {
            return this.get('photo');
        },
        set: function (val) {
            this.set('photo', val);
        }
    });

    Object.defineProperty(Item.prototype, 'itemCategory', {
        get: function () {
            return this.get('itemCategory');
        },
        set: function (val) {
            this.set('itemCategory', val);
        }
    });

    Object.defineProperty(Item.prototype, 'restaurant', {
        get: function () {
            return this.get('restaurant');
        },
        set: function (val) {
            this.set('restaurant', val);
        }
    });


    Object.defineProperty(Item.prototype, 'canonical', {
        get: function () {
            return this.get('canonical');
        },
        set: function (val) {
            this.set('canonical', val);
        }
    });

    Object.defineProperty(Item.prototype, 'isActive', {
        get: function () {
            return this.get('isActive');
        },
        set: function (val) {
            this.set('isActive', val);
        }
    });

    return Item;

});