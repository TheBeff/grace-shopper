'use strict';

app.directive('notification', ['$timeout', function ($timeout) {
    return {
      restric: "E",
      template: '<div class="alert alert-success"> Item added to cart </div>'
    };
}]);