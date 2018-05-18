angular.module('main').factory('Order', function ($q) {

    var Order = Parse.Object.extend('Order', {

      toQrCode: function () {
        return `https://chart.googleapis.com/chart?cht=qr&chs=300x300&chl=${this}&choe=UTF-8`;
      }

    }, {

            new() {
                return new Order();
            },

            all: function (params) {

                var defer = $q.defer();
                var query = new Parse.Query(this);

                if (params && params.search) {
                    query.equalTo('numberOrder', Number(params.search));
                }

                if (params && params.orderType) {
                    query.equalTo('orderType', params.orderType);
                }

                if (params && params.status) {
                    query.equalTo('statusOrder', params.status);
                }

                if (params && params.restaurant) {
                    query.equalTo('restaurant', params.restaurant);
                }

                if (params && params.date) {
                    var start = moment(params.date).startOf('day');
                    var end = moment(params.date).endOf('day');
                    query.greaterThanOrEqualTo('createdAt', start.toDate());
                    query.lessThanOrEqualTo('createdAt', end.toDate());
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

                query.include(["restaurant", "customer", "zone"]);

                query.find().then(function (order) {
                    defer.resolve(order);
                }, function (error) {
                    defer.reject(error);
                });

                return defer.promise;

            },

            pending: function () {
             
              var defer = $q.defer();
              var query = new Parse.Query(this);

              query.equalTo('statusOrder', 'Pending');
              //query.equalTo('isAcknowledged', false);

              query.find().then(function (order) {
                defer.resolve(order);
              }, function (error) {
                defer.reject(error);
              });

              return defer.promise;
            },

            search: function (params) {

                var defer = $q.defer();
                var query = new Parse.Query(this);

                if (params && params.search) {
                    query.contains('canonical', params.search);
                }

                query.find().then(function (order) {
                    defer.resolve(order);
                }, function (error) {
                    defer.reject(error);
                })

                return defer.promise;

            },

            count: function (params) {

                var defer = $q.defer();
                var query = new Parse.Query(this);

                if (params && params.search) {
                    query.contains('numberOrder', params.search);
                }

                query.count().then(function (order) {
                    defer.resolve(order);
                }, function (error) {
                    defer.reject(error);
                })

                return defer.promise;

            },

            save: function (order) {

                var defer = $q.defer();

                order.save().then(function (obj) {
                    defer.resolve(obj);
                }, function (error) {
                    defer.reject(error);
                });

                return defer.promise;
            }

        });

    Object.defineProperty(Order.prototype, 'objectId', {
        get: function () {
            return this.get('objectId');
        },
        set: function (val) {
            this.set('objectId', val);
        }
    });

    Object.defineProperty(Order.prototype, 'numberOrder', {
        get: function () {
            return this.get('numberOrder');
        },
        set: function (val) {
            this.set('numberOrder', val);
        }
    });

    Object.defineProperty(Order.prototype, 'items', {
        get: function () {
            return this.get('items');
        },
        set: function (val) {
            this.set('items', val);
        }
    });

    Object.defineProperty(Order.prototype, 'subtotal', {
        get: function () {
            return this.get('subtotal');
        },
        set: function (val) {
            this.set('subtotal', val);
        }
    });

    Object.defineProperty(Order.prototype, 'total', {
        get: function () {
            return this.get('total');
        },
        set: function (val) {
            this.set('total', val);
        }
    });

    Object.defineProperty(Order.prototype, 'payment', {
        get: function () {
            return this.get('payment');
        },
        set: function (val) {
            this.set('payment', val);
        }
    });

    Object.defineProperty(Order.prototype, 'orderType', {
        get: function () {
            return this.get('orderType');
        },
        set: function (val) {
            this.set('orderType', val);
        }
    });

    Object.defineProperty(Order.prototype, 'shipping', {
        get: function () {
            return this.get('shipping');
        },
        set: function (val) {
            this.set('shipping', val);
        }
    });

    Object.defineProperty(Order.prototype, 'deliveryFee', {
        get: function () {
            return this.get('deliveryFee');
        },
        set: function (val) {
            this.set('deliveryFee', val);
        }
    });

    Object.defineProperty(Order.prototype, 'restaurant', {
        get: function () {
            return this.get('restaurant');
        },
        set: function (val) {
            this.set('restaurant', val);
        }
    });

    Object.defineProperty(Order.prototype, 'customer', {
        get: function () {
            return this.get('customer');
        },
        set: function (val) {
            this.set('customer', val);
        }
    });

    Object.defineProperty(Order.prototype, 'zone', {
        get: function () {
            return this.get('zone');
        },
        set: function (val) {
            this.set('zone', val);
        }
    });

    Object.defineProperty(Order.prototype, 'contactNumber', {
        get: function () {
            return this.get('contactNumber');
        },
        set: function (val) {
            this.set('contactNumber', val);
        }
    });

    Object.defineProperty(Order.prototype, 'deliveryTime', {
        get: function () {
            return this.get('deliveryTime');
        },
        set: function (val) {
            this.set('deliveryTime', val);
        }
    });

    Object.defineProperty(Order.prototype, 'reason', {
        get: function () {
            return this.get('reason');
        },
        set: function (val) {
            this.set('reason', val);
        }
    });

    Object.defineProperty(Order.prototype, 'statusOrder', {
        get: function () {
            return this.get('statusOrder');
        },
        set: function (val) {
            this.set('statusOrder', val);
        }
    });

    Object.defineProperty(Order.prototype, 'folio', {
        get: function () {
            return this.get('folio');
        },
        set: function (val) {
            this.set('folio', val);
        }
    });

    Object.defineProperty(Order.prototype, 'shippingFullAddress', {
      get: function () {
        return this.orderType === 'Delivery' ? `${this.shipping.streetAddress}, ${this.shipping.city}, ${this.shipping.state}` : '---';
      }
    });

    Order.prototype.toString = function orderToString() {

        var itemList = '';

        for (var i = 0; i < this.items.length; i++) {
            var item = this.items[i];
            itemList += item.quantity + '%0A' + item.externalId + '%0A' + (item.notes || '---') + '%0A';
        }
        
        var region = this.zone ? this.zone.get('name') : '---';
        var customerName = this.customer.name || '---';

        return `${this.contactNumber}%0A${customerName}%0A${region}%0A${itemList}${this.numberOrder}`;
    }

    return Order;

});