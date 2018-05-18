angular.module('main').factory('TimeZone', function ($q, $http) {

    return {
        ListZones: function () {

            var defer = $q.defer();

            $http.get('/timezones').success(function (data) {
                defer.resolve(data);
            });

            return defer.promise;
        }
    }

});