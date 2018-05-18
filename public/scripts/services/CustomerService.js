angular.module('main').factory('Customer', function ($q) {

    var Customer = Parse.Object.extend('Customer', {

    }, {

        new() {
            return new Customer();
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


            query.find().then(function (customer) {
                defer.resolve(customer);
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
                query.equalTo('isActive', true);
            }

            query.find().then(function (customer) {
                defer.resolve(customer);
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

            query.count().then(function (customer) {
                defer.resolve(customer);
            }, function (error) {
                defer.reject(error);
            })

            return defer.promise;

        },

        save: function (customer) {

            var defer = $q.defer();

            customer.save().then(function (obj) {
                defer.resolve(obj);
            }, function (error) {
                defer.reject(error);
            });

            return defer.promise;
        }

    });

    Object.defineProperty(Customer.prototype, 'objectId', {
        get: function () {
            return this.get('objectId');
        },
        set: function (val) {
            this.set('objectId', val);
        }
    });

    Object.defineProperty(Customer.prototype, 'name', {
        get: function () {
            return this.get('name');
        },
        set: function (val) {
            this.set('name', val);
        }
    });

    Object.defineProperty(Customer.prototype, 'lastName', {
        get: function () {
            return this.get('lastName');
        },
        set: function (val) {
            this.set('lastName', val);
        }
    });

    Object.defineProperty(Customer.prototype, 'street', {
        get: function () {
            return this.get('street');
        },
        set: function (val) {
            this.set('street', val);
        }
    });

    Object.defineProperty(Customer.prototype, 'locationName', {
        get: function () {
            return this.get('locationName');
        },
        set: function (val) {
            this.set('locationName', val);
        }
    });

    Object.defineProperty(Customer.prototype, 'zipCode', {
        get: function () {
            return this.get('zipCode');
        },
        set: function (val) {
            this.set('zipCode', val);
        }
    });

    Object.defineProperty(Customer.prototype, 'canonical', {
        get: function () {
            return this.get('canonical');
        },
        set: function (val) {
            this.set('canonical', val);
        }
    });

    Object.defineProperty(Customer.prototype, 'isActive', {
        get: function () {
            return this.get('isActive');
        },
        set: function (val) {
            this.set('isActive', val);
        }
    });


    return Customer;

});