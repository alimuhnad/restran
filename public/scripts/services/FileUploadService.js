'use strict';
angular.module('main').factory('File', function ($q) {

  return {

    upload: function (file, isBase64) {

      var defer = $q.defer();

      var filename = 'file.' + file.name.split('.').pop();

      var payload = isBase64 ? { base64: file } : file;

      var parseFile = new Parse.File(filename, payload);
      parseFile.save({
        success: function (savedFile) {
          defer.resolve(savedFile);
        },
        error: function (error) {
          defer.reject(error);
        }
      });

       return defer.promise;
     },

     uploadBase64: function (base64, filename) {

      var defer = $q.defer();

      var parseFile = new Parse.File(filename, { base64: base64 });
      parseFile.save({
        success: function (savedFile) {
          defer.resolve(savedFile);
        },
        error: function (error) {
          defer.reject(error);
        }
      });

       return defer.promise;
     }
   };
});
