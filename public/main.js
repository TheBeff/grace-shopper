'use strict';

window.app = angular.module('FullstackGeneratedApp', ['ngMessages', 'gavruk.card', 'ngPassword', 'fsaPreBuilt', 'ui.router', 'ui.bootstrap', 'ngAnimate']);

app.config(function ($urlRouterProvider, $locationProvider) {
  // This turns off hashbang urls (/#about) and changes it to something normal (/about)
  $locationProvider.html5Mode(true);
  // If we go to a URL that ui-router doesn't have registered, go to the "/" url.
  $urlRouterProvider.otherwise('/');
  // Trigger page refresh when accessing an OAuth route
  $urlRouterProvider.when('/auth/:provider', function () {
    window.location.reload();
  });
});

// This app.run is for listening to errors broadcasted by ui-router, usually originating from resolves
app.run(function ($rootScope) {
  $rootScope.$on('$stateChangeError', function (event, toState, toParams, fromState, fromParams, thrownError) {
    console.info('The following error was thrown by ui-router while transitioning to state "' + toState.name + '". The origin of this error is probably a resolve function:');
    console.error(thrownError);
  });
});

// This app.run is for controlling access to specific states.
app.run(function ($rootScope, AuthService, $state) {

  // The given state requires an authenticated user.
  var destinationStateRequiresAuth = function destinationStateRequiresAuth(state) {
    return state.data && state.data.authenticate;
  };

  // $stateChangeStart is an event fired
  // whenever the process of changing a state begins.
  $rootScope.$on('$stateChangeStart', function (event, toState, toParams) {

    if (!destinationStateRequiresAuth(toState)) {
      // The destination state does not require authentication
      // Short circuit with return.
      return;
    }

    if (AuthService.isAuthenticated()) {
      // The user is authenticated.
      // Short circuit with return.
      return;
    }

    // Cancel navigating to new state.
    event.preventDefault();

    AuthService.getLoggedInUser().then(function (user) {
      // If a user is retrieved, then renavigate to the destination
      // (the second time, AuthService.isAuthenticated() will work)
      // otherwise, if no user is logged in, go to "login" state.
      if (user) {
        $state.go(toState.name, toParams);
      } else {
        $state.go('login');
      }
    });
  });
});

app.config(function ($stateProvider) {

  // Register our *about* state.
  $stateProvider.state('about', {
    url: '/about',
    controller: 'AboutController',
    templateUrl: 'js/about/about.html'
  });
});

app.controller('AboutController', function ($scope, FullstackPics) {

  // Images of beautiful Fullstack people.
  $scope.images = _.shuffle(FullstackPics);
});

app.controller("AccountCtrl", function ($scope, $log, AccountService) {

  AccountService.getUser().then(function (user) {
    $scope.user = user;
  }).catch($log.error);

  AccountService.getOrders().then(function (orders) {
    $scope.orders = orders;
  }).catch($log.error);
});
app.factory('AccountService', function ($http) {

  var AccountService = {};

  AccountService.getUser = function () {
    return $http.get('/session').then(function (user) {
      return user.data;
    });
  };

  AccountService.getOrders = function () {
    return $http.get('/api/account/orders').then(function (orders) {
      return orders.data;
    });
  };

  return AccountService;
});
app.config(function ($stateProvider) {

  $stateProvider.state('account', {
    url: '/account',
    templateUrl: 'js/account/account.html',
    controller: 'AccountCtrl',
    // The following data.authenticate is read by an event listener
    // that controls access to this state. Refer to app.js.
    data: {
      authenticate: true
    }
  });
});

"use strict";

app.controller('CartCtrl', function ($scope, $log, CartService, ProductsService) {

  CartService.getCart().then(function (cart) {
    $scope.cart = cart;
    $scope.lineItems = cart.lineItems;
  }).catch($log.error);

  $scope.clearCart = function (cart) {
    $scope.lineItems = [];
    return CartService.clearCart(cart);
  };

  $scope.inventoryArray = ProductsService.inventoryArray;

  $scope.changeQuantity = CartService.changeQuantity;

  $scope.deleteLineItem = CartService.deleteLineItem;

  //$scope.goToCheckOut = CartService.goToCheckOut;
});

"use strict";

app.factory('CartService', function (Session, $http, $window, $q, $state) {

  var CartService = {};
  var _cart = {};

  var _getCartRemotely = function _getCartRemotely() {
    return $http.get('/api/cart').then(function (cart) {
      angular.copy(cart.data, _cart);
      return _cart;
    });
  };

  var _getCartLocally = function _getCartLocally() {
    var cart = $window.sessionStorage.getItem('cart');
    if (cart) {
      cart = JSON.parse(cart);
    } else {
      cart = { lineItems: [] };
      $window.sessionStorage.setItem('cart', JSON.stringify(cart));
    }
    var dfd = $q.defer();
    angular.copy(cart, _cart);
    dfd.resolve(_cart);
    return dfd.promise;
  };

  CartService.getCart = function () {
    if (Session.user) {
      return _getCartRemotely();
    } else {
      return _getCartLocally();
    }
  };

  var _clearCartRemotely = function _clearCartRemotely(cart) {
    cart.lineItems.forEach(function (lineItem) {
      return $http.delete('/api/orders/' + cart.id + '/lineitems/' + lineItem.id);
    });
    _cart.lineItems = [];
  };

  var _clearCartLocally = function _clearCartLocally(cart) {
    return _getCartLocally().then(function (cart) {
      cart.lineItems = [];
      $window.sessionStorage.setItem('cart', JSON.stringify(cart));
    });
  };

  CartService.clearCart = function (cart) {
    if (Session.user) {
      return _clearCartRemotely(cart);
    } else {
      return _clearCartLocally(cart);
    }
  };

  CartService.changeQuantity = function (cart, lineitem, quantity) {
    if (quantity === null) {
      return this.deleteLineItem(cart, lineitem);
    } else if (Session.user) {
      return $http.put('/api/orders/' + cart.id + '/lineItems/' + lineitem.id, { quantity: quantity }).then(function () {
        console.log('quantity updated');
      });
    } else {
      var idx = _cart.lineItems.indexOf(lineitem);
      _cart.lineItems[idx].quantity = quantity;
      $window.sessionStorage.setItem('cart', JSON.stringify(_cart));
    }
  };

  CartService.deleteLineItem = function (cart, lineitem) {
    if (Session.user) {
      $http.delete('/api/orders/' + cart.id + '/lineItems/' + lineitem.id).then(function () {
        var idx = _cart.lineItems.indexOf(lineitem);
        _cart.lineItems.splice(idx, 1);
      });
    } else {
      var idx = _cart.lineItems.indexOf(lineitem);
      _cart.lineItems.splice(idx, 1);
      $window.sessionStorage.setItem('cart', JSON.stringify(_cart));
      var dfd = $q.defer();
      dfd.resolve();
      return dfd.promise;
    }
  };

  var _createLineItemRemotely = function _createLineItemRemotely(product, quantity, currentCart) {
    var info = {
      price: product.price,
      quantity: quantity,
      orderId: currentCart.id,
      productId: product.id
    };

    var itemUrl = '/api/orders/' + currentCart.id + '/lineItems';
    var matchedLineItem = _checkForItemInCart(product, currentCart);
    if (matchedLineItem) {
      info.quantity += matchedLineItem.quantity;
      return $http.put(itemUrl + '/' + matchedLineItem.id, info);
    } else {
      return $http.post(itemUrl, info);
    }
  };

  var _createLineItemLocally = function _createLineItemLocally(product, quantity, currentCart) {
    console.log('in create line local');
    return _getCartLocally().then(function (cart) {
      var matchedLineItem = _checkForItemInCart(product, cart);
      if (matchedLineItem) {
        var idx = cart.lineItems.indexOf(matchedLineItem);
        cart.lineItems[idx].quantity += quantity;
      } else {
        cart.lineItems.push({
          product: { title: product.title, inventory_qty: product.inventory_qty },
          price: product.price,
          quantity: quantity,
          productId: product.id
        });
      }
      $window.sessionStorage.setItem('cart', JSON.stringify(cart));
      return _getCartLocally();
    });
  };

  CartService.createLineItem = function (product, quantity, currentCart) {
    if (Session.user) {
      return _createLineItemRemotely(product, quantity, currentCart);
    } else {
      return _createLineItemLocally(product, quantity, currentCart);
    }
  };

  var _checkForItemInCart = function _checkForItemInCart(product, currentCart) {
    if (currentCart.lineItems) {
      var idArray = currentCart.lineItems.map(function (lineItem) {
        return lineItem.productId;
      });

      var index = idArray.indexOf(product.id);

      if (index >= 0) {
        return currentCart.lineItems[index];
      } else {
        return false;
      }
    } else return false;
  };

  CartService.syncCart = function () {
    _getCartRemotely().then(function (dbCart) {
      var cart = $window.sessionStorage.getItem('cart');
      if (cart) {
        cart = JSON.parse(cart);
        $window.sessionStorage.removeItem('cart');
        var promises = [];
        cart.lineItems.forEach(function (lineitem) {
          var product = {
            inventory_qty: lineitem.product.inventory_qty,
            title: lineitem.product.title,
            price: lineitem.product.price,
            id: lineitem.productId
          };
          promises.push(_createLineItemRemotely(product, lineitem.quantity, dbCart));
        });
        return $q.all(promises);
      }
    });
  };

  // CartService.goToCheckOut = function(cart){
  // 	return $http.put('/api/orders/' + cart.id)
  // 	.then($state.go('checkout'));
  //  	};

  return CartService;
});

app.run(function (AUTH_EVENTS, CartService, $rootScope) {
  $rootScope.$on(AUTH_EVENTS.loginSuccess, function () {
    CartService.getCart().then(function () {
      CartService.syncCart();
    });
  });
  $rootScope.$on(AUTH_EVENTS.logoutSuccess, function () {
    CartService.getCart();
  });
  CartService.getCart();
});

app.config(function ($stateProvider) {
  $stateProvider.state('cart', {
    url: '/cart',
    templateUrl: 'js/cart/cart.html',
    controller: 'CartCtrl'
  });
});

"use strict";

app.controller('CheckoutCtrl', function ($scope, $log, CartService, CheckoutService) {

  $scope.card = {
    name: 'Mike Brown',
    number: '5555 4444 3333 1111',
    expiry: '11 / 2020',
    cvc: '123'
  };

  $scope.cardPlaceholders = {
    name: 'Your Full Name',
    number: 'xxxx xxxx xxxx xxxx',
    expiry: 'MM/YY',
    cvc: 'xxx'
  };

  $scope.cardMessages = {
    validDate: 'valid\nthru',
    monthYear: 'MM/YYYY'
  };

  $scope.cardOptions = {
    debug: false,
    formatting: true
  };

  CartService.getCart().then(function (cart) {
    $scope.cart = cart;
    $scope.lineItems = cart.lineItems;
  }).catch($log.error);

  $scope.placeOrder = CheckoutService.placeOrder;
});
"use strict";

app.factory('CheckoutService', function ($http, $state) {
  var CheckoutService = {};

  CheckoutService.placeOrder = function (cart) {
    return $http.put('/api/orders/' + cart.id, {
      status: "order"
    }).then(function (order) {
      if (order.config.data.status == "order") {
        $state.go("confirmation");
      } else {
        console.log("not an order yet");
      }
    });
  };

  return CheckoutService;
});

"use strict";

app.config(function ($stateProvider) {
  $stateProvider.state('checkout', {
    url: '/checkout',
    templateUrl: 'js/checkout/checkout.html',
    controller: 'CheckoutCtrl'
  });

  $stateProvider.state('confirmation', {
    url: '/confirmation',
    templateUrl: 'js/checkout/confirmation.html'
  });
});
app.config(function ($stateProvider) {
  $stateProvider.state('docs', {
    url: '/docs',
    templateUrl: 'js/docs/docs.html'
  });
});

(function () {

  'use strict';

  // Hope you didn't forget Angular! Duh-doy.

  if (!window.angular) throw new Error('I can\'t find Angular!');

  var app = angular.module('fsaPreBuilt', []);

  app.factory('Socket', function () {
    if (!window.io) throw new Error('socket.io not found!');
    return window.io(window.location.origin);
  });

  // AUTH_EVENTS is used throughout our app to
  // broadcast and listen from and to the $rootScope
  // for important events about authentication flow.
  app.constant('AUTH_EVENTS', {
    loginSuccess: 'auth-login-success',
    loginFailed: 'auth-login-failed',
    logoutSuccess: 'auth-logout-success',
    sessionTimeout: 'auth-session-timeout',
    notAuthenticated: 'auth-not-authenticated',
    notAuthorized: 'auth-not-authorized'
  });

  app.factory('AuthInterceptor', function ($rootScope, $q, AUTH_EVENTS) {
    var statusDict = {
      401: AUTH_EVENTS.notAuthenticated,
      403: AUTH_EVENTS.notAuthorized,
      419: AUTH_EVENTS.sessionTimeout,
      440: AUTH_EVENTS.sessionTimeout
    };
    return {
      responseError: function responseError(response) {
        $rootScope.$broadcast(statusDict[response.status], response);
        return $q.reject(response);
      }
    };
  });

  app.config(function ($httpProvider) {
    $httpProvider.interceptors.push(['$injector', function ($injector) {
      return $injector.get('AuthInterceptor');
    }]);
  });

  app.service('AuthService', function ($http, Session, $rootScope, AUTH_EVENTS, $q) {

    function onSuccessfulLogin(response) {
      var user = response.data.user;
      Session.create(user);
      $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
      return user;
    }

    // Uses the session factory to see if an
    // authenticated user is currently registered.
    this.isAuthenticated = function () {
      console.log('user');
      console.log(Session.user);
      return !!Session.user;
    };

    this.getLoggedInUser = function (fromServer) {

      // If an authenticated session exists, we
      // return the user attached to that session
      // with a promise. This ensures that we can
      // always interface with this method asynchronously.

      // Optionally, if true is given as the fromServer parameter,
      // then this cached value will not be used.

      if (this.isAuthenticated() && fromServer !== true) {
        return $q.when(Session.user);
      }

      // Make request GET /session.
      // If it returns a user, call onSuccessfulLogin with the response.
      // If it returns a 401 response, we catch it and instead resolve to null.
      return $http.get('/session').then(onSuccessfulLogin).catch(function () {
        return null;
      });
    };

    this.login = function (credentials) {
      return $http.post('/login', credentials).then(onSuccessfulLogin).catch(function () {
        return $q.reject({ message: 'Invalid login credentials.' });
      });
    };

    this.logout = function () {
      return $http.get('/logout').then(function () {
        Session.destroy();
        $rootScope.$broadcast(AUTH_EVENTS.logoutSuccess);
      });
    };
  });

  app.service('Session', function ($rootScope, AUTH_EVENTS) {

    var self = this;

    $rootScope.$on(AUTH_EVENTS.notAuthenticated, function () {
      self.destroy();
    });

    $rootScope.$on(AUTH_EVENTS.sessionTimeout, function () {
      self.destroy();
    });

    this.user = null;

    this.create = function (user) {
      this.user = user;
    };

    this.destroy = function () {
      this.user = null;
    };
  });
})();

app.config(function ($stateProvider) {
  $stateProvider.state('home', {
    url: '/',
    templateUrl: 'js/home/home.html'
  });
});

app.config(function ($stateProvider) {

  $stateProvider.state('login', {
    url: '/login',
    templateUrl: 'js/login/login.html',
    controller: 'LoginCtrl'
  });
});

app.controller('LoginCtrl', function ($scope, AuthService, $state) {

  $scope.login = {};
  $scope.error = null;

  $scope.sendLogin = function (loginInfo) {

    $scope.error = null;

    AuthService.login(loginInfo).then(function () {
      $state.go('home');
    }).catch(function () {
      $scope.error = 'Invalid login credentials.';
    });
  };
});

app.controller('ProductsCtrl', function ($scope, $log, Session, ProductsService, CartService) {

  ProductsService.findAll().then(function (products) {
    $scope.products = products;
  }).catch($log.error);

  $scope.isAdmin = function () {
    if (Session.user) {
      return Session.user.isAdmin;
    }return false;
  };

  $scope.create = function () {
    ProductsService.create({
      title: $scope.title,
      description: $scope.description,
      category: $scope.category,
      price: $scope.price,
      inventory_qty: $scope.inventory,
      photos: $scope.photo
    }).then(function () {
      $scope.title = '';
      $scope.description = '';
      $scope.category = '';
      $scope.price = '';
      $scope.inventory = '';
      $scope.photo = '';
    }).catch($log.error);
  };

  $scope.destroy = function (product) {
    ProductsService.destroy(product).then(function () {
      console.log('product deleted');
    }).catch($log.error);
  };

  $scope.inventoryArray = ProductsService.inventoryArray;

  CartService.getCart().then(function (cart) {
    $scope.cart = cart;
  }).catch($log.error);

  $scope.addToCart = function (product, quantity, cart) {
    CartService.createLineItem(product, quantity, cart).then(function () {
      return CartService.getCart();
    }).then(function (cart) {
      $scope.cart = cart;
    }).catch($log.error);
  };
});

'use strict';

app.directive('notification', ['$timeout', function ($timeout) {
  return {
    restric: "E",
    template: '<div class="alert alert-success"> Item added to cart </div>'
  };
}]);
app.factory('ProductsService', function (Session, $http) {

  var ProductsService = {};
  var _products = [];
  var oneProduct = {};
  var cart = [];

  ProductsService.findAll = function () {
    return $http.get('/api/products').then(function (products) {
      angular.copy(products.data, _products);
      return _products;
    });
  };

  ProductsService.findOne = function (id) {
    return $http.get('/api/products/' + id).then(function (product) {
      // console.log(product.data);
      angular.copy(product.data, oneProduct);
      return oneProduct;
    });
  };

  ProductsService.create = function (product) {
    return $http.post('/api/products', product).then(function (response) {
      _products.push(response.data);
    });
  };

  ProductsService.destroy = function (product) {
    return $http.delete('/api/products/' + product.id).then(function () {
      _products.splice(_products.indexOf(product), 1);
    });
  };

  ProductsService.inventoryArray = function (product) {
    var inventoryArray = [];
    var quantity = void 0;
    if (product.inventory_qty <= 25) {
      quantity = product.inventory_qty;
    } else {
      quantity = 25;
    }
    for (var i = 1; i <= quantity; i++) {
      inventoryArray.push(i);
    }
    return inventoryArray;
  };

  return ProductsService;
});

app.config(function ($stateProvider) {

  $stateProvider.state('products', {
    url: '/products',
    templateUrl: 'js/products/products.html',
    controller: 'ProductsCtrl'
  }).state('detail', {
    url: '/products/:id',
    templateUrl: 'js/products/products-detail.html',
    resolve: {
      detailProduct: function detailProduct($stateParams, ProductsService) {
        return ProductsService.findOne($stateParams.id);
      }
    },
    controller: function controller($scope, detailProduct, $stateParams, $log, CartService, ProductsService) {
      $scope.product = detailProduct;
      $scope.inventoryArray = ProductsService.inventoryArray(detailProduct);
      CartService.getCart().then(function (cart) {
        $scope.cart = cart;
      }).catch($log.error);
      $scope.addToCart = function (product, quantity, cart) {
        if ($scope.cart) {
          ProductsService.addToCart(product, quantity, cart).then().catch($log.error);
        } else {
          ProductsService.addToCart(product, quantity, cart);
        }
      };
    }
  });
});

app.config(function ($stateProvider) {
  $stateProvider.state('signup', {
    url: '/signup',
    templateUrl: '/js/signup/signup.html',
    controller: 'SignupCtrl'
  });
});

app.controller('SignupCtrl', function ($state, $scope, SignupFactory) {

  $scope.signUp = function () {
    SignupFactory.signUp($scope.credentials).then(function (email) {
      if (!email) $state.go('home');
      $scope.Email = email;
    });
  };
});

app.factory('SignupFactory', function ($http) {
  var signUpObj = {};

  signUpObj.email = null;

  signUpObj.signUp = function (credentials) {
    return $http.post('/api/signup', credentials).then(function (user) {
      signUpObj.email = user.data.email;
      return signUpObj.email;
    });
  };

  return signUpObj;
});

app.factory('FullstackPics', function () {
  return ['https://pbs.twimg.com/media/B7gBXulCAAAXQcE.jpg:large', 'https://fbcdn-sphotos-c-a.akamaihd.net/hphotos-ak-xap1/t31.0-8/10862451_10205622990359241_8027168843312841137_o.jpg', 'https://pbs.twimg.com/media/B-LKUshIgAEy9SK.jpg', 'https://pbs.twimg.com/media/B79-X7oCMAAkw7y.jpg', 'https://pbs.twimg.com/media/B-Uj9COIIAIFAh0.jpg:large', 'https://pbs.twimg.com/media/B6yIyFiCEAAql12.jpg:large', 'https://pbs.twimg.com/media/CE-T75lWAAAmqqJ.jpg:large', 'https://pbs.twimg.com/media/CEvZAg-VAAAk932.jpg:large', 'https://pbs.twimg.com/media/CEgNMeOXIAIfDhK.jpg:large', 'https://pbs.twimg.com/media/CEQyIDNWgAAu60B.jpg:large', 'https://pbs.twimg.com/media/CCF3T5QW8AE2lGJ.jpg:large', 'https://pbs.twimg.com/media/CAeVw5SWoAAALsj.jpg:large', 'https://pbs.twimg.com/media/CAaJIP7UkAAlIGs.jpg:large', 'https://pbs.twimg.com/media/CAQOw9lWEAAY9Fl.jpg:large', 'https://pbs.twimg.com/media/B-OQbVrCMAANwIM.jpg:large', 'https://pbs.twimg.com/media/B9b_erwCYAAwRcJ.png:large', 'https://pbs.twimg.com/media/B5PTdvnCcAEAl4x.jpg:large', 'https://pbs.twimg.com/media/B4qwC0iCYAAlPGh.jpg:large', 'https://pbs.twimg.com/media/B2b33vRIUAA9o1D.jpg:large', 'https://pbs.twimg.com/media/BwpIwr1IUAAvO2_.jpg:large', 'https://pbs.twimg.com/media/BsSseANCYAEOhLw.jpg:large', 'https://pbs.twimg.com/media/CJ4vLfuUwAAda4L.jpg:large', 'https://pbs.twimg.com/media/CI7wzjEVEAAOPpS.jpg:large', 'https://pbs.twimg.com/media/CIdHvT2UsAAnnHV.jpg:large', 'https://pbs.twimg.com/media/CGCiP_YWYAAo75V.jpg:large', 'https://pbs.twimg.com/media/CIS4JPIWIAI37qu.jpg:large'];
});

app.factory('RandomGreetings', function () {

  var getRandomFromArray = function getRandomFromArray(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
  };

  var greetings = ['Hello, world!', 'At long last, I live!', 'Hello, simple human.', 'What a beautiful day!', 'I\'m like any other project, except that I am yours. :)', 'This empty string is for Lindsay Levine.', 'こんにちは、ユーザー様。', 'Welcome. To. WEBSITE.', ':D', 'Yes, I think we\'ve met before.', 'Gimme 3 mins... I just grabbed this really dope frittata', 'If Cooper could offer only one piece of advice, it would be to nevSQUIRREL!'];

  return {
    greetings: greetings,
    getRandomGreeting: function getRandomGreeting() {
      return getRandomFromArray(greetings);
    }
  };
});

app.directive('fullstackLogo', function () {
  return {
    restrict: 'E',
    templateUrl: 'js/common/directives/fullstack-logo/fullstack-logo.html'
  };
});

app.directive('navbar', function ($rootScope, AuthService, AUTH_EVENTS, $state) {

  return {
    restrict: 'E',
    scope: {},
    templateUrl: 'js/common/directives/navbar/navbar.html',
    link: function link(scope) {

      scope.items = [{ label: 'Home', state: 'home' }, { label: 'Products', state: 'products' }, { label: 'About', state: 'about' }, { label: 'Account', state: 'account' }, { label: 'Cart', state: 'cart' }];

      scope.user = null;

      scope.isLoggedIn = function () {
        return AuthService.isAuthenticated();
      };

      scope.logout = function () {
        AuthService.logout().then(function () {
          $state.go('home');
        });
      };

      var setUser = function setUser() {
        AuthService.getLoggedInUser().then(function (user) {
          scope.user = user;
        });
      };

      var removeUser = function removeUser() {
        scope.user = null;
      };

      setUser();

      $rootScope.$on(AUTH_EVENTS.loginSuccess, setUser);
      $rootScope.$on(AUTH_EVENTS.logoutSuccess, removeUser);
      $rootScope.$on(AUTH_EVENTS.sessionTimeout, removeUser);
    }

  };
});

app.directive('randoGreeting', function (RandomGreetings) {

  return {
    restrict: 'E',
    templateUrl: 'js/common/directives/rando-greeting/rando-greeting.html',
    link: function link(scope) {
      scope.greeting = RandomGreetings.getRandomGreeting();
    }
  };
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFwcC5qcyIsImFib3V0L2Fib3V0LmpzIiwiYWNjb3VudC9hY2NvdW50LWNvbnRyb2xsZXIuanMiLCJhY2NvdW50L2FjY291bnQtc2VydmljZS5qcyIsImFjY291bnQvYWNjb3VudC5qcyIsImNhcnQvY2FydC1jb250cm9sbGVyLmpzIiwiY2FydC9jYXJ0LXNlcnZpY2UuanMiLCJjYXJ0L2NhcnQtc3RhdGUuanMiLCJjaGVja291dC9jaGVja291dC1jb250cm9sbGVyLmpzIiwiY2hlY2tvdXQvY2hlY2tvdXQtc2VydmljZS5qcyIsImNoZWNrb3V0L2NoZWNrb3V0LXN0YXRlLmpzIiwiZG9jcy9kb2NzLmpzIiwiZnNhL2ZzYS1wcmUtYnVpbHQuanMiLCJob21lL2hvbWUuanMiLCJsb2dpbi9sb2dpbi5qcyIsInByb2R1Y3RzL3Byb2R1Y3RzLWNvbnRyb2xsZXIuanMiLCJwcm9kdWN0cy9wcm9kdWN0cy1kaXJlY3RpdmUuanMiLCJwcm9kdWN0cy9wcm9kdWN0cy1zZXJ2aWNlLmpzIiwicHJvZHVjdHMvcHJvZHVjdHMuanMiLCJzaWdudXAvc2lnbnVwLmpzIiwiY29tbW9uL2ZhY3Rvcmllcy9GdWxsc3RhY2tQaWNzLmpzIiwiY29tbW9uL2ZhY3Rvcmllcy9SYW5kb21HcmVldGluZ3MuanMiLCJjb21tb24vZGlyZWN0aXZlcy9mdWxsc3RhY2stbG9nby9mdWxsc3RhY2stbG9nby5qcyIsImNvbW1vbi9kaXJlY3RpdmVzL25hdmJhci9uYXZiYXIuanMiLCJjb21tb24vZGlyZWN0aXZlcy9yYW5kby1ncmVldGluZy9yYW5kby1ncmVldGluZy5qcyJdLCJuYW1lcyI6WyJ3aW5kb3ciLCJhcHAiLCJhbmd1bGFyIiwibW9kdWxlIiwiY29uZmlnIiwiJHVybFJvdXRlclByb3ZpZGVyIiwiJGxvY2F0aW9uUHJvdmlkZXIiLCJodG1sNU1vZGUiLCJvdGhlcndpc2UiLCJ3aGVuIiwibG9jYXRpb24iLCJyZWxvYWQiLCJydW4iLCIkcm9vdFNjb3BlIiwiJG9uIiwiZXZlbnQiLCJ0b1N0YXRlIiwidG9QYXJhbXMiLCJmcm9tU3RhdGUiLCJmcm9tUGFyYW1zIiwidGhyb3duRXJyb3IiLCJjb25zb2xlIiwiaW5mbyIsIm5hbWUiLCJlcnJvciIsIkF1dGhTZXJ2aWNlIiwiJHN0YXRlIiwiZGVzdGluYXRpb25TdGF0ZVJlcXVpcmVzQXV0aCIsInN0YXRlIiwiZGF0YSIsImF1dGhlbnRpY2F0ZSIsImlzQXV0aGVudGljYXRlZCIsInByZXZlbnREZWZhdWx0IiwiZ2V0TG9nZ2VkSW5Vc2VyIiwidGhlbiIsInVzZXIiLCJnbyIsIiRzdGF0ZVByb3ZpZGVyIiwidXJsIiwiY29udHJvbGxlciIsInRlbXBsYXRlVXJsIiwiJHNjb3BlIiwiRnVsbHN0YWNrUGljcyIsImltYWdlcyIsIl8iLCJzaHVmZmxlIiwiJGxvZyIsIkFjY291bnRTZXJ2aWNlIiwiZ2V0VXNlciIsImNhdGNoIiwiZ2V0T3JkZXJzIiwib3JkZXJzIiwiZmFjdG9yeSIsIiRodHRwIiwiZ2V0IiwiQ2FydFNlcnZpY2UiLCJQcm9kdWN0c1NlcnZpY2UiLCJnZXRDYXJ0IiwiY2FydCIsImxpbmVJdGVtcyIsImNsZWFyQ2FydCIsImludmVudG9yeUFycmF5IiwiY2hhbmdlUXVhbnRpdHkiLCJkZWxldGVMaW5lSXRlbSIsIlNlc3Npb24iLCIkd2luZG93IiwiJHEiLCJfY2FydCIsIl9nZXRDYXJ0UmVtb3RlbHkiLCJjb3B5IiwiX2dldENhcnRMb2NhbGx5Iiwic2Vzc2lvblN0b3JhZ2UiLCJnZXRJdGVtIiwiSlNPTiIsInBhcnNlIiwic2V0SXRlbSIsInN0cmluZ2lmeSIsImRmZCIsImRlZmVyIiwicmVzb2x2ZSIsInByb21pc2UiLCJfY2xlYXJDYXJ0UmVtb3RlbHkiLCJmb3JFYWNoIiwibGluZUl0ZW0iLCJkZWxldGUiLCJpZCIsIl9jbGVhckNhcnRMb2NhbGx5IiwibGluZWl0ZW0iLCJxdWFudGl0eSIsInB1dCIsImxvZyIsImlkeCIsImluZGV4T2YiLCJzcGxpY2UiLCJfY3JlYXRlTGluZUl0ZW1SZW1vdGVseSIsInByb2R1Y3QiLCJjdXJyZW50Q2FydCIsInByaWNlIiwib3JkZXJJZCIsInByb2R1Y3RJZCIsIml0ZW1VcmwiLCJtYXRjaGVkTGluZUl0ZW0iLCJfY2hlY2tGb3JJdGVtSW5DYXJ0IiwicG9zdCIsIl9jcmVhdGVMaW5lSXRlbUxvY2FsbHkiLCJwdXNoIiwidGl0bGUiLCJpbnZlbnRvcnlfcXR5IiwiY3JlYXRlTGluZUl0ZW0iLCJpZEFycmF5IiwibWFwIiwiaW5kZXgiLCJzeW5jQ2FydCIsImRiQ2FydCIsInJlbW92ZUl0ZW0iLCJwcm9taXNlcyIsImFsbCIsIkFVVEhfRVZFTlRTIiwibG9naW5TdWNjZXNzIiwibG9nb3V0U3VjY2VzcyIsIkNoZWNrb3V0U2VydmljZSIsImNhcmQiLCJudW1iZXIiLCJleHBpcnkiLCJjdmMiLCJjYXJkUGxhY2Vob2xkZXJzIiwiY2FyZE1lc3NhZ2VzIiwidmFsaWREYXRlIiwibW9udGhZZWFyIiwiY2FyZE9wdGlvbnMiLCJkZWJ1ZyIsImZvcm1hdHRpbmciLCJwbGFjZU9yZGVyIiwic3RhdHVzIiwib3JkZXIiLCJFcnJvciIsImlvIiwib3JpZ2luIiwiY29uc3RhbnQiLCJsb2dpbkZhaWxlZCIsInNlc3Npb25UaW1lb3V0Iiwibm90QXV0aGVudGljYXRlZCIsIm5vdEF1dGhvcml6ZWQiLCJzdGF0dXNEaWN0IiwicmVzcG9uc2VFcnJvciIsInJlc3BvbnNlIiwiJGJyb2FkY2FzdCIsInJlamVjdCIsIiRodHRwUHJvdmlkZXIiLCJpbnRlcmNlcHRvcnMiLCIkaW5qZWN0b3IiLCJzZXJ2aWNlIiwib25TdWNjZXNzZnVsTG9naW4iLCJjcmVhdGUiLCJmcm9tU2VydmVyIiwibG9naW4iLCJjcmVkZW50aWFscyIsIm1lc3NhZ2UiLCJsb2dvdXQiLCJkZXN0cm95Iiwic2VsZiIsInNlbmRMb2dpbiIsImxvZ2luSW5mbyIsImZpbmRBbGwiLCJwcm9kdWN0cyIsImlzQWRtaW4iLCJkZXNjcmlwdGlvbiIsImNhdGVnb3J5IiwiaW52ZW50b3J5IiwicGhvdG9zIiwicGhvdG8iLCJhZGRUb0NhcnQiLCJkaXJlY3RpdmUiLCIkdGltZW91dCIsInJlc3RyaWMiLCJ0ZW1wbGF0ZSIsIl9wcm9kdWN0cyIsIm9uZVByb2R1Y3QiLCJmaW5kT25lIiwiaSIsImRldGFpbFByb2R1Y3QiLCIkc3RhdGVQYXJhbXMiLCJTaWdudXBGYWN0b3J5Iiwic2lnblVwIiwiZW1haWwiLCJFbWFpbCIsInNpZ25VcE9iaiIsImdldFJhbmRvbUZyb21BcnJheSIsImFyciIsIk1hdGgiLCJmbG9vciIsInJhbmRvbSIsImxlbmd0aCIsImdyZWV0aW5ncyIsImdldFJhbmRvbUdyZWV0aW5nIiwicmVzdHJpY3QiLCJzY29wZSIsImxpbmsiLCJpdGVtcyIsImxhYmVsIiwiaXNMb2dnZWRJbiIsInNldFVzZXIiLCJyZW1vdmVVc2VyIiwiUmFuZG9tR3JlZXRpbmdzIiwiZ3JlZXRpbmciXSwibWFwcGluZ3MiOiJBQUFBOztBQUNBQSxPQUFBQyxHQUFBLEdBQUFDLFFBQUFDLE1BQUEsQ0FBQSx1QkFBQSxFQUFBLENBQUEsWUFBQSxFQUFBLGFBQUEsRUFBQSxXQUFBLEVBQUEsY0FBQSxFQUFBLFdBQUEsQ0FBQSxDQUFBOztBQUVBRixJQUFBRyxNQUFBLENBQUEsVUFBQUMsa0JBQUEsRUFBQUMsaUJBQUEsRUFBQTtBQUNBO0FBQ0FBLG9CQUFBQyxTQUFBLENBQUEsSUFBQTtBQUNBO0FBQ0FGLHFCQUFBRyxTQUFBLENBQUEsR0FBQTtBQUNBO0FBQ0FILHFCQUFBSSxJQUFBLENBQUEsaUJBQUEsRUFBQSxZQUFBO0FBQ0FULFdBQUFVLFFBQUEsQ0FBQUMsTUFBQTtBQUNBLEdBRkE7QUFHQSxDQVRBOztBQVdBO0FBQ0FWLElBQUFXLEdBQUEsQ0FBQSxVQUFBQyxVQUFBLEVBQUE7QUFDQUEsYUFBQUMsR0FBQSxDQUFBLG1CQUFBLEVBQUEsVUFBQUMsS0FBQSxFQUFBQyxPQUFBLEVBQUFDLFFBQUEsRUFBQUMsU0FBQSxFQUFBQyxVQUFBLEVBQUFDLFdBQUEsRUFBQTtBQUNBQyxZQUFBQyxJQUFBLGdGQUFBTixRQUFBTyxJQUFBO0FBQ0FGLFlB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QUEsWUFBQVEsUUFBQSxHQUFBRCxnQkFBQVQsaUJBQUEsRUFBQTtBQUNBO0FBTEEsR0FBQTtBQVFBLENBVkEiLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXNDb250ZW50IjpbIid1c2Ugc3RyaWN0JztcbndpbmRvdy5hcHAgPSBhbmd1bGFyLm1vZHVsZSgnRnVsbHN0YWNrR2VuZXJhdGVkQXBwJywgWyduZ1Bhc3N3b3JkJywgJ2ZzYVByZUJ1aWx0JywgJ3VpLnJvdXRlcicsICd1aS5ib290c3RyYXAnLCAnbmdBbmltYXRlJ10pO1xuXG5hcHAuY29uZmlnKGZ1bmN0aW9uICgkdXJsUm91dGVyUHJvdmlkZXIsICRsb2NhdGlvblByb3ZpZGVyKSB7XG4gICAgLy8gVGhpcyB0dXJucyBvZmYgaGFzaGJhbmcgdXJscyAoLyNhYm91dCkgYW5kIGNoYW5nZXMgaXQgdG8gc29tZXRoaW5nIG5vcm1hbCAoL2Fib3V0KVxuICAgICRsb2NhdGlvblByb3ZpZGVyLmh0bWw1TW9kZSh0cnVlKTtcbiAgICAvLyBJZiB3ZSBnbyB0byBhIFVSTCB0aGF0IHVpLXJvdXRlciBkb2Vzbid0IGhhdmUgcmVnaXN0ZXJlZCwgZ28gdG8gdGhlIFwiL1wiIHVybC5cbiAgICAkdXJsUm91dGVyUHJvdmlkZXIub3RoZXJ3aXNlKCcvJyk7XG4gICAgLy8gVHJpZ2dlciBwYWdlIHJlZnJlc2ggd2hlbiBhY2Nlc3NpbmcgYW4gT0F1dGggcm91dGVcbiAgICAkdXJsUm91dGVyUHJvdmlkZXIud2hlbignL2F1dGgvOnByb3ZpZGVyJywgZnVuY3Rpb24gKCkge1xuICAgICAgICB3aW5kb3cubG9jYXRpb24ucmVsb2FkKCk7XG4gICAgfSk7XG59KTtcblxuLy8gVGhpcyBhcHAucnVuIGlzIGZvciBsaXN0ZW5pbmcgdG8gZXJyb3JzIGJyb2FkY2FzdGVkIGJ5IHVpLXJvdXRlciwgdXN1YWxseSBvcmlnaW5hdGluZyBmcm9tIHJlc29sdmVzXG5hcHAucnVuKGZ1bmN0aW9uICgkcm9vdFNjb3BlKSB7XG4gICAgJHJvb3RTY29wZS4kb24oJyRzdGF0ZUNoYW5nZUVycm9yJywgZnVuY3Rpb24gKGV2ZW50LCB0b1N0YXRlLCB0b1BhcmFtcywgZnJvbVN0YXRlLCBmcm9tUGFyYW1zLCB0aHJvd25FcnJvcikge1xuICAgICAgICBjb25zb2xlLmluZm8oYFRoZSBmb2xsb3dpbmcgZXJyb3Igd2FzIHRocm93biBieSB1aS1yb3V0ZXIgd2hpbGUgdHJhbnNpdGlvbmluZyB0byBzdGF0ZSBcIiR7dG9TdGF0ZS5uYW1lfVwiLiBUaGUgb3JpZ2luIG9mIHRoaXMgZXJyb3IgaXMgcHJvYmFibHkgYSByZXNvbHZlIGZ1bmN0aW9uOmApO1xuICAgICAgICBjb25zb2xlLmVycm9yKHRocm93bkVycm9yKTtcbiAgICB9KTtcbn0pO1xuXG4vLyBUaGlzIGFwcC5ydW4gaXMgZm9yIGNvbnRyb2xsaW5nIGFjY2VzcyB0byBzcGVjaWZpYyBzdGF0ZXMuXG5hcHAucnVuKGZ1bmN0aW9uICgkcm9vdFNjb3BlLCBBdXRoU2VydmljZSwgJHN0YXRlKSB7XG5cbiAgICAvLyBUaGUgZ2l2ZW4gc3RhdGUgcmVxdWlyZXMgYW4gYXV0aGVudGljYXRlZCB1c2VyLlxuICAgIHZhciBkZXN0aW5hdGlvblN0YXRlUmVxdWlyZXNBdXRoID0gZnVuY3Rpb24gKHN0YXRlKSB7XG4gICAgICAgIHJldHVybiBzdGF0ZS5kYXRhICYmIHN0YXRlLmRhdGEuYXV0aGVudGljYXRlO1xuICAgIH07XG5cbiAgICAvLyAkc3RhdGVDaGFuZ2VTdGFydCBpcyBhbiBldmVudCBmaXJlZFxuICAgIC8vIHdoZW5ldmVyIHRoZSBwcm9jZXNzIG9mIGNoYW5naW5nIGEgc3RhdGUgYmVnaW5zLlxuICAgICRyb290U2NvcGUuJG9uKCckc3RhdGVDaGFuZ2VTdGFydCcsIGZ1bmN0aW9uIChldmVudCwgdG9TdGF0ZSwgdG9QYXJhbXMpIHtcblxuICAgICAgICBpZiAoIWRlc3RpbmF0aW9uU3RhdGVSZXF1aXJlc0F1dGgodG9TdGF0ZSkpIHtcbiAgICAgICAgICAgIC8vIFRoZSBkZXN0aW5hdGlvbiBzdGF0ZSBkb2VzIG5vdCByZXF1aXJlIGF1dGhlbnRpY2F0aW9uXG4gICAgICAgICAgICAvLyBTaG9ydCBjaXJjdWl0IHdpdGggcmV0dXJuLlxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKEF1dGhTZXJ2aWNlLmlzQXV0aGVudGljYXRlZCgpKSB7XG4gICAgICAgICAgICAvLyBUaGUgdXNlciBpcyBhdXRoZW50aWNhdGVkLlxuICAgICAgICAgICAgLy8gU2hvcnQgY2lyY3VpdCB3aXRoIHJldHVybi5cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENhbmNlbCBuYXZpZ2F0aW5nIHRvIG5ldyBzdGF0ZS5cbiAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICBBdXRoU2VydmljZS5nZXRMb2dnZWRJblVzZXIoKS50aGVuKGZ1bmN0aW9uICh1c2VyKSB7XG4gICAgICAgICAgICAvLyBJZiBhIHVzZXIgaXMgcmV0cmlldmVkLCB0aGVuIHJlbmF2aWdhdGUgdG8gdGhlIGRlc3RpbmF0aW9uXG4gICAgICAgICAgICAvLyAodGhlIHNlY29uZCB0aW1lLCBBdXRoU2VydmljZS5pc0F1dGhlbnRpY2F0ZWQoKSB3aWxsIHdvcmspXG4gICAgICAgICAgICAvLyBvdGhlcndpc2UsIGlmIG5vIHVzZXIgaXMgbG9nZ2VkIGluLCBnbyB0byBcImxvZ2luXCIgc3RhdGUuXG4gICAgICAgICAgICBpZiAodXNlcikge1xuICAgICAgICAgICAgICAgICRzdGF0ZS5nbyh0b1N0YXRlLm5hbWUsIHRvUGFyYW1zKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgJHN0YXRlLmdvKCdsb2dpbicpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgIH0pO1xuXG59KTtcbiIsImFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG5cbiAgICAvLyBSZWdpc3RlciBvdXIgKmFib3V0KiBzdGF0ZS5cbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnYWJvdXQnLCB7XG4gICAgICAgIHVybDogJy9hYm91dCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdBYm91dENvbnRyb2xsZXInLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2Fib3V0L2Fib3V0Lmh0bWwnXG4gICAgfSk7XG5cbn0pO1xuXG5hcHAuY29udHJvbGxlcignQWJvdXRDb250cm9sbGVyJywgZnVuY3Rpb24gKCRzY29wZSwgRnVsbHN0YWNrUGljcykge1xuXG4gICAgLy8gSW1hZ2VzIG9mIGJlYXV0aWZ1bCBGdWxsc3RhY2sgcGVvcGxlLlxuICAgICRzY29wZS5pbWFnZXMgPSBfLnNodWZmbGUoRnVsbHN0YWNrUGljcyk7XG5cbn0pO1xuIiwiYXBwLmNvbnRyb2xsZXIoXCJBY2NvdW50Q3RybFwiLCBmdW5jdGlvbigkc2NvcGUsICRsb2csIEFjY291bnRTZXJ2aWNlKXtcblxuICBBY2NvdW50U2VydmljZS5nZXRVc2VyKClcbiAgICAudGhlbihmdW5jdGlvbih1c2VyKXtcbiAgICBcdCRzY29wZS51c2VyID0gdXNlcjtcbiAgICB9KVxuICAgIC5jYXRjaCgkbG9nLmVycm9yKTtcblx0IFxuICBBY2NvdW50U2VydmljZS5nZXRPcmRlcnMoKVxuICAgIC50aGVuKGZ1bmN0aW9uKG9yZGVycyl7XG4gICAgXHQkc2NvcGUub3JkZXJzID0gb3JkZXJzO1xuICAgIH0pXG4gICAgLmNhdGNoKCRsb2cuZXJyb3IpOyAgXG5cbn0pOyIsImFwcC5mYWN0b3J5KCdBY2NvdW50U2VydmljZScsIGZ1bmN0aW9uKCRodHRwKXtcblxuXHR2YXIgQWNjb3VudFNlcnZpY2UgPSB7fTtcblxuXHRBY2NvdW50U2VydmljZS5nZXRVc2VyID0gZnVuY3Rpb24oKXtcblx0XHRyZXR1cm4gJGh0dHAuZ2V0KCcvc2Vzc2lvbicpXG5cdFx0ICAudGhlbihmdW5jdGlvbih1c2VyKXtcblx0XHQgIFx0cmV0dXJuIHVzZXIuZGF0YTtcblx0XHQgIH0pXG5cdH07XG5cblx0QWNjb3VudFNlcnZpY2UuZ2V0T3JkZXJzID0gZnVuY3Rpb24oKXtcblx0XHRyZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL2FjY291bnQvb3JkZXJzJylcblx0XHQgIC50aGVuKGZ1bmN0aW9uKG9yZGVycyl7XG5cdFx0ICBcdHJldHVybiBvcmRlcnMuZGF0YTtcblx0XHQgIH0pXG5cdH07XG5cblx0cmV0dXJuIEFjY291bnRTZXJ2aWNlO1xufSk7IiwiYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcblxuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdhY2NvdW50Jywge1xuICAgICAgICB1cmw6ICcvYWNjb3VudCcsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvYWNjb3VudC9hY2NvdW50Lmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnQWNjb3VudEN0cmwnLFxuICAgICAgICAvLyBUaGUgZm9sbG93aW5nIGRhdGEuYXV0aGVudGljYXRlIGlzIHJlYWQgYnkgYW4gZXZlbnQgbGlzdGVuZXJcbiAgICAgICAgLy8gdGhhdCBjb250cm9scyBhY2Nlc3MgdG8gdGhpcyBzdGF0ZS4gUmVmZXIgdG8gYXBwLmpzLlxuICAgICAgICBkYXRhOiB7XG4gICAgICAgICAgICBhdXRoZW50aWNhdGU6IHRydWVcbiAgICAgICAgfVxuICAgIH0pO1xuXG59KTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG5hcHAuY29udHJvbGxlcignQ2FydEN0cmwnLCBmdW5jdGlvbigkc2NvcGUsICRsb2csIENhcnRTZXJ2aWNlLCBQcm9kdWN0c1NlcnZpY2Upe1xuXG5cdENhcnRTZXJ2aWNlLmdldENhcnQoKVxuXHRcdC50aGVuKGZ1bmN0aW9uKGNhcnQpe1xuXHRcdFx0JHNjb3BlLmNhcnQgPSBjYXJ0O1xuXHRcdFx0JHNjb3BlLmxpbmVJdGVtcyA9IGNhcnQubGluZUl0ZW1zO1xuXHRcdH0pXG5cdFx0LmNhdGNoKCRsb2cuZXJyb3IpO1xuXG5cdCRzY29wZS5jbGVhckNhcnQgPSBmdW5jdGlvbihjYXJ0KXtcblx0XHQkc2NvcGUubGluZUl0ZW1zID0gW107XG5cdFx0cmV0dXJuIENhcnRTZXJ2aWNlLmNsZWFyQ2FydChjYXJ0KTtcblx0fTtcblxuXHQkc2NvcGUuaW52ZW50b3J5QXJyYXkgPSBQcm9kdWN0c1NlcnZpY2UuaW52ZW50b3J5QXJyYXk7XG5cblx0JHNjb3BlLmNoYW5nZVF1YW50aXR5ID0gQ2FydFNlcnZpY2UuY2hhbmdlUXVhbnRpdHk7XG5cblx0JHNjb3BlLmRlbGV0ZUxpbmVJdGVtID0gQ2FydFNlcnZpY2UuZGVsZXRlTGluZUl0ZW07XG5cblx0Ly8kc2NvcGUuZ29Ub0NoZWNrT3V0ID0gQ2FydFNlcnZpY2UuZ29Ub0NoZWNrT3V0O1xuXG59KTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG5hcHAuZmFjdG9yeSgnQ2FydFNlcnZpY2UnLCBmdW5jdGlvbihTZXNzaW9uLCAkaHR0cCwgJHdpbmRvdywgJHEsICRzdGF0ZSl7XG5cblx0dmFyIENhcnRTZXJ2aWNlID0ge307XG5cdHZhciBfY2FydCA9IHt9O1xuXG5cdHZhciBfZ2V0Q2FydFJlbW90ZWx5ID0gZnVuY3Rpb24oKXtcblx0XHRyZXR1cm4gJGh0dHAuZ2V0KCcvYXBpL2NhcnQnKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24oY2FydCl7XG5cdFx0XHRcdGFuZ3VsYXIuY29weShjYXJ0LmRhdGEsIF9jYXJ0KTtcblx0XHRcdFx0cmV0dXJuIF9jYXJ0O1xuXHRcdFx0fSk7XG5cdH07XG5cblx0dmFyIF9nZXRDYXJ0TG9jYWxseSA9IGZ1bmN0aW9uKCl7XG5cdFx0dmFyIGNhcnQgPSAkd2luZG93LnNlc3Npb25TdG9yYWdlLmdldEl0ZW0oJ2NhcnQnKTtcblx0XHRpZiAoY2FydCkge1xuXHRcdFx0Y2FydCA9IEpTT04ucGFyc2UoY2FydCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdGNhcnQgPSB7IGxpbmVJdGVtczogW10gfTtcblx0XHRcdCR3aW5kb3cuc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbSgnY2FydCcsIEpTT04uc3RyaW5naWZ5KGNhcnQpKTtcblx0XHR9XG5cdFx0dmFyIGRmZCA9ICRxLmRlZmVyKCk7XG5cdFx0YW5ndWxhci5jb3B5KGNhcnQsIF9jYXJ0KTtcblx0XHRkZmQucmVzb2x2ZShfY2FydCk7XG5cdFx0cmV0dXJuIGRmZC5wcm9taXNlO1xuXHR9O1xuXG5cdENhcnRTZXJ2aWNlLmdldENhcnQgPSBmdW5jdGlvbigpe1xuXHRcdGlmIChTZXNzaW9uLnVzZXIpIHtcblx0XHRcdHJldHVybiBfZ2V0Q2FydFJlbW90ZWx5KCk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHJldHVybiBfZ2V0Q2FydExvY2FsbHkoKTtcblx0XHR9XG5cdH07XG5cblx0dmFyIF9jbGVhckNhcnRSZW1vdGVseSA9IGZ1bmN0aW9uKGNhcnQpe1xuXHRcdGNhcnQubGluZUl0ZW1zLmZvckVhY2goZnVuY3Rpb24obGluZUl0ZW0pe1xuXHRcdFx0cmV0dXJuICRodHRwLmRlbGV0ZSgnL2FwaS9vcmRlcnMvJyArIGNhcnQuaWQgKyAnL2xpbmVpdGVtcy8nICsgbGluZUl0ZW0uaWQpO1xuXHRcdH0pO1xuXHRcdF9jYXJ0LmxpbmVJdGVtcyA9IFtdO1xuXHR9O1xuXG5cdHZhciBfY2xlYXJDYXJ0TG9jYWxseSA9IGZ1bmN0aW9uKGNhcnQpe1xuXHRcdHJldHVybiBfZ2V0Q2FydExvY2FsbHkoKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24oY2FydCl7XG5cdFx0XHRcdGNhcnQubGluZUl0ZW1zID0gW107XG5cdFx0XHRcdCR3aW5kb3cuc2Vzc2lvblN0b3JhZ2Uuc2V0SXRlbSgnY2FydCcsIEpTT04uc3RyaW5naWZ5KGNhcnQpKTtcblx0XHRcdH0pO1xuXHR9O1xuXG5cdENhcnRTZXJ2aWNlLmNsZWFyQ2FydCA9IGZ1bmN0aW9uKGNhcnQpe1xuXHRcdGlmIChTZXNzaW9uLnVzZXIpe1xuXHRcdFx0cmV0dXJuIF9jbGVhckNhcnRSZW1vdGVseShjYXJ0KTtcblx0XHR9XG5cdFx0ZWxzZSB7XG5cdFx0XHRyZXR1cm4gX2NsZWFyQ2FydExvY2FsbHkoY2FydCk7XG5cdFx0fVxuXHR9O1xuXG5cdENhcnRTZXJ2aWNlLmNoYW5nZVF1YW50aXR5ID0gZnVuY3Rpb24oY2FydCwgbGluZWl0ZW0sIHF1YW50aXR5KXtcblx0XHRpZiAocXVhbnRpdHkgPT09IG51bGwpIHtcblx0XHRcdHJldHVybiB0aGlzLmRlbGV0ZUxpbmVJdGVtKGNhcnQsIGxpbmVpdGVtKTtcblx0XHR9XG5cdFx0ZWxzZSBpZiAoU2Vzc2lvbi51c2VyKSB7XG5cdFx0XHRyZXR1cm4gJGh0dHAucHV0KCcvYXBpL29yZGVycy8nICsgY2FydC5pZCArICcvbGluZUl0ZW1zLycgKyBsaW5laXRlbS5pZCwge3F1YW50aXR5fSlcblx0XHRcdFx0LnRoZW4oZnVuY3Rpb24oKXtcblx0XHRcdFx0XHRjb25zb2xlLmxvZygncXVhbnRpdHkgdXBkYXRlZCcpO1xuXHRcdFx0XHR9KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0dmFyIGlkeCA9IF9jYXJ0LmxpbmVJdGVtcy5pbmRleE9mKGxpbmVpdGVtKTtcblx0XHRcdF9jYXJ0LmxpbmVJdGVtc1tpZHhdLnF1YW50aXR5ID0gcXVhbnRpdHk7XG5cdFx0XHQkd2luZG93LnNlc3Npb25TdG9yYWdlLnNldEl0ZW0oJ2NhcnQnLCBKU09OLnN0cmluZ2lmeShfY2FydCkpO1xuXHRcdH1cblx0fTtcblxuXHRDYXJ0U2VydmljZS5kZWxldGVMaW5lSXRlbSA9IGZ1bmN0aW9uKGNhcnQsIGxpbmVpdGVtKXtcblx0XHRpZiAoU2Vzc2lvbi51c2VyKSB7XG5cdFx0XHQkaHR0cC5kZWxldGUoJy9hcGkvb3JkZXJzLycgKyBjYXJ0LmlkICsgJy9saW5lSXRlbXMvJyArIGxpbmVpdGVtLmlkKVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24oKXtcblx0XHRcdFx0dmFyIGlkeCA9IF9jYXJ0LmxpbmVJdGVtcy5pbmRleE9mKGxpbmVpdGVtKTtcblx0XHRcdFx0X2NhcnQubGluZUl0ZW1zLnNwbGljZShpZHgsIDEpO1xuXHRcdFx0fSk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdHZhciBpZHggPSBfY2FydC5saW5lSXRlbXMuaW5kZXhPZihsaW5laXRlbSk7XG5cdFx0XHRfY2FydC5saW5lSXRlbXMuc3BsaWNlKGlkeCwgMSk7XG5cdFx0XHQkd2luZG93LnNlc3Npb25TdG9yYWdlLnNldEl0ZW0oJ2NhcnQnLCBKU09OLnN0cmluZ2lmeShfY2FydCkpO1xuXHRcdFx0dmFyIGRmZCA9ICRxLmRlZmVyKCk7XG5cdFx0XHRkZmQucmVzb2x2ZSgpO1xuXHRcdFx0cmV0dXJuIGRmZC5wcm9taXNlO1xuXHRcdH1cblx0fTtcblxuXHR2YXIgX2NyZWF0ZUxpbmVJdGVtUmVtb3RlbHkgPSBmdW5jdGlvbihwcm9kdWN0LCBxdWFudGl0eSwgY3VycmVudENhcnQpe1xuXHRcdGxldCBpbmZvID0ge1xuXHRcdFx0cHJpY2U6IHByb2R1Y3QucHJpY2UsXG5cdFx0XHRxdWFudGl0eSxcblx0XHRcdG9yZGVySWQ6IGN1cnJlbnRDYXJ0LmlkLFxuXHRcdFx0cHJvZHVjdElkOiBwcm9kdWN0LmlkXG5cdFx0fTtcblxuXHRcdGxldCBpdGVtVXJsID0gJy9hcGkvb3JkZXJzLycgKyBjdXJyZW50Q2FydC5pZCArICcvbGluZUl0ZW1zJztcblx0XHRsZXQgbWF0Y2hlZExpbmVJdGVtID0gX2NoZWNrRm9ySXRlbUluQ2FydChwcm9kdWN0LCBjdXJyZW50Q2FydCk7XG5cdFx0aWYgKG1hdGNoZWRMaW5lSXRlbSkge1xuXHRcdCAgaW5mby5xdWFudGl0eSArPSBtYXRjaGVkTGluZUl0ZW0ucXVhbnRpdHk7XG5cdFx0ICByZXR1cm4gJGh0dHAucHV0KGl0ZW1VcmwgKyAnLycgKyBtYXRjaGVkTGluZUl0ZW0uaWQsIGluZm8pO1xuXHRcdH0gZWxzZSB7XG5cdFx0ICAgIHJldHVybiAkaHR0cC5wb3N0KGl0ZW1VcmwsIGluZm8pO1xuXHQgICAgfSBcblx0fTtcblxuXHR2YXIgX2NyZWF0ZUxpbmVJdGVtTG9jYWxseSA9IGZ1bmN0aW9uKHByb2R1Y3QsIHF1YW50aXR5LCBjdXJyZW50Q2FydCl7XG5cdFx0Y29uc29sZS5sb2coJ2luIGNyZWF0ZSBsaW5lIGxvY2FsJyk7XG5cdFx0cmV0dXJuIF9nZXRDYXJ0TG9jYWxseSgpXG5cdFx0XHQudGhlbihmdW5jdGlvbihjYXJ0KXtcblx0XHRcdFx0bGV0IG1hdGNoZWRMaW5lSXRlbSA9IF9jaGVja0Zvckl0ZW1JbkNhcnQocHJvZHVjdCwgY2FydCk7XG5cdFx0XHRcdGlmIChtYXRjaGVkTGluZUl0ZW0pe1xuXHRcdFx0XHRcdHZhciBpZHggPSBjYXJ0LmxpbmVJdGVtcy5pbmRleE9mKG1hdGNoZWRMaW5lSXRlbSlcblx0XHRcdFx0XHRjYXJ0LmxpbmVJdGVtc1tpZHhdLnF1YW50aXR5ICs9IHF1YW50aXR5O1xuXHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdGNhcnQubGluZUl0ZW1zLnB1c2goe1xuXHRcdFx0XHRcdFx0cHJvZHVjdDoge3RpdGxlOiBwcm9kdWN0LnRpdGxlLCBpbnZlbnRvcnlfcXR5OiBwcm9kdWN0LmludmVudG9yeV9xdHl9LFxuXHRcdFx0XHRcdFx0cHJpY2U6IHByb2R1Y3QucHJpY2UsXG5cdFx0XHRcdFx0XHRxdWFudGl0eTogcXVhbnRpdHksXG5cdFx0XHRcdFx0XHRwcm9kdWN0SWQ6IHByb2R1Y3QuaWRcblx0XHRcdFx0XHR9KTtcblx0XHRcdFx0fVxuXHRcdFx0XHQkd2luZG93LnNlc3Npb25TdG9yYWdlLnNldEl0ZW0oJ2NhcnQnLCBKU09OLnN0cmluZ2lmeShjYXJ0KSk7XG5cdFx0XHRcdHJldHVybiBfZ2V0Q2FydExvY2FsbHkoKTtcblx0XHRcdH0pO1xuXHR9O1xuXG5cdENhcnRTZXJ2aWNlLmNyZWF0ZUxpbmVJdGVtID0gZnVuY3Rpb24ocHJvZHVjdCwgcXVhbnRpdHksIGN1cnJlbnRDYXJ0KXtcblx0XHRpZiAoU2Vzc2lvbi51c2VyKSB7XG5cdFx0XHRyZXR1cm4gX2NyZWF0ZUxpbmVJdGVtUmVtb3RlbHkocHJvZHVjdCwgcXVhbnRpdHksIGN1cnJlbnRDYXJ0KTtcblx0XHR9IGVsc2Uge1xuXHRcdFx0cmV0dXJuIF9jcmVhdGVMaW5lSXRlbUxvY2FsbHkocHJvZHVjdCwgcXVhbnRpdHksIGN1cnJlbnRDYXJ0KTtcblx0XHR9XG5cdH07XHRcblxuXHR2YXIgX2NoZWNrRm9ySXRlbUluQ2FydCA9IGZ1bmN0aW9uKHByb2R1Y3QsIGN1cnJlbnRDYXJ0KXtcblx0XHRpZihjdXJyZW50Q2FydC5saW5lSXRlbXMpe1xuXHRcdFx0bGV0IGlkQXJyYXkgPSBjdXJyZW50Q2FydC5saW5lSXRlbXMubWFwKGZ1bmN0aW9uKGxpbmVJdGVtKXtcblx0XHRcdFx0cmV0dXJuIGxpbmVJdGVtLnByb2R1Y3RJZDtcblx0XHRcdH0pO1xuXG5cdFx0XHRsZXQgaW5kZXggPSBpZEFycmF5LmluZGV4T2YocHJvZHVjdC5pZCk7XG5cblx0XHRcdGlmIChpbmRleCA+PSAwKSB7XG5cdFx0XHRcdHJldHVybiBjdXJyZW50Q2FydC5saW5lSXRlbXNbaW5kZXhdO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdFx0fVxuXHRcdH1cblx0XHRlbHNlIHJldHVybiBmYWxzZTtcblx0fTtcblxuXHRDYXJ0U2VydmljZS5zeW5jQ2FydCA9IGZ1bmN0aW9uKCl7XG5cdFx0X2dldENhcnRSZW1vdGVseSgpXG5cdFx0XHQudGhlbihmdW5jdGlvbihkYkNhcnQpe1xuXHRcdFx0XHR2YXIgY2FydCA9ICR3aW5kb3cuc2Vzc2lvblN0b3JhZ2UuZ2V0SXRlbSgnY2FydCcpO1xuXHRcdFx0XHRpZiAoY2FydCkge1xuXHRcdFx0XHRcdGNhcnQgPSBKU09OLnBhcnNlKGNhcnQpO1xuXHRcdFx0XHRcdCR3aW5kb3cuc2Vzc2lvblN0b3JhZ2UucmVtb3ZlSXRlbSgnY2FydCcpO1xuXHRcdFx0XHRcdHZhciBwcm9taXNlcyA9IFtdO1xuXHRcdFx0XHRcdGNhcnQubGluZUl0ZW1zLmZvckVhY2goZnVuY3Rpb24obGluZWl0ZW0pe1xuXHRcdFx0XHRcdFx0dmFyIHByb2R1Y3QgPSB7XG5cdFx0XHRcdFx0XHRcdGludmVudG9yeV9xdHk6IGxpbmVpdGVtLnByb2R1Y3QuaW52ZW50b3J5X3F0eSxcblx0XHRcdFx0XHRcdFx0dGl0bGU6IGxpbmVpdGVtLnByb2R1Y3QudGl0bGUsXG5cdFx0XHRcdFx0XHRcdHByaWNlOiBsaW5laXRlbS5wcm9kdWN0LnByaWNlLFxuXHRcdFx0XHRcdFx0XHRpZDogbGluZWl0ZW0ucHJvZHVjdElkXG5cdFx0XHRcdFx0XHR9O1xuXHRcdFx0XHRcdFx0cHJvbWlzZXMucHVzaChfY3JlYXRlTGluZUl0ZW1SZW1vdGVseShwcm9kdWN0LCBsaW5laXRlbS5xdWFudGl0eSwgZGJDYXJ0KSk7XG5cdFx0XHRcdFx0fSk7XG5cdFx0XHRcdFx0cmV0dXJuICRxLmFsbChwcm9taXNlcyk7XG5cdFx0XHRcdH1cblx0XHRcdH0pO1xuXHR9O1xuXG5cdC8vIENhcnRTZXJ2aWNlLmdvVG9DaGVja091dCA9IGZ1bmN0aW9uKGNhcnQpe1xuXHQvLyBcdHJldHVybiAkaHR0cC5wdXQoJy9hcGkvb3JkZXJzLycgKyBjYXJ0LmlkKVxuXHQvLyBcdC50aGVuKCRzdGF0ZS5nbygnY2hlY2tvdXQnKSk7XG4gLy8gIFx0fTtcblxuXHRyZXR1cm4gQ2FydFNlcnZpY2U7XG59KTtcblxuYXBwLnJ1bihmdW5jdGlvbihBVVRIX0VWRU5UUywgQ2FydFNlcnZpY2UsICRyb290U2NvcGUpe1xuXHQkcm9vdFNjb3BlLiRvbihBVVRIX0VWRU5UUy5sb2dpblN1Y2Nlc3MsIGZ1bmN0aW9uKCl7XG5cdFx0Q2FydFNlcnZpY2UuZ2V0Q2FydCgpXG5cdFx0XHQudGhlbihmdW5jdGlvbigpe1xuXHRcdFx0XHRDYXJ0U2VydmljZS5zeW5jQ2FydCgpO1xuXHRcdFx0fSk7XG5cdH0pO1xuXHQkcm9vdFNjb3BlLiRvbihBVVRIX0VWRU5UUy5sb2dvdXRTdWNjZXNzLCBmdW5jdGlvbigpe1xuXHRcdENhcnRTZXJ2aWNlLmdldENhcnQoKTtcblx0fSk7XG5cdENhcnRTZXJ2aWNlLmdldENhcnQoKTtcbn0pO1xuIiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcil7XG5cdCRzdGF0ZVByb3ZpZGVyXG5cdFx0LnN0YXRlKCdjYXJ0Jywge1xuXHRcdFx0dXJsOiAnL2NhcnQnLFxuXHRcdFx0dGVtcGxhdGVVcmw6ICdqcy9jYXJ0L2NhcnQuaHRtbCcsXG5cdFx0XHRjb250cm9sbGVyOiAnQ2FydEN0cmwnXG5cdFx0fSk7XG59KTtcbiIsIlwidXNlIHN0cmljdFwiO1xuXG5hcHAuY29udHJvbGxlcignQ2hlY2tvdXRDdHJsJywgZnVuY3Rpb24gKCRzY29wZSwgJGxvZywgQ2FydFNlcnZpY2UsIENoZWNrb3V0U2VydmljZSkge1xuXG4gICAgJHNjb3BlLmNhcmQgPSB7XG4gICAgICAgIG5hbWU6ICdNaWtlIEJyb3duJyxcbiAgICAgICAgbnVtYmVyOiAnNTU1NSA0NDQ0IDMzMzMgMTExMScsXG4gICAgICAgIGV4cGlyeTogJzExIC8gMjAyMCcsXG4gICAgICAgIGN2YzogJzEyMydcbiAgICB9O1xuXG4gICAgJHNjb3BlLmNhcmRQbGFjZWhvbGRlcnMgPSB7XG4gICAgICAgIG5hbWU6ICdZb3VyIEZ1bGwgTmFtZScsXG4gICAgICAgIG51bWJlcjogJ3h4eHggeHh4eCB4eHh4IHh4eHgnLFxuICAgICAgICBleHBpcnk6ICdNTS9ZWScsXG4gICAgICAgIGN2YzogJ3h4eCdcbiAgICB9O1xuXG4gICAgJHNjb3BlLmNhcmRNZXNzYWdlcyA9IHtcbiAgICAgICAgdmFsaWREYXRlOiAndmFsaWRcXG50aHJ1JyxcbiAgICAgICAgbW9udGhZZWFyOiAnTU0vWVlZWScsXG4gICAgfTtcblxuICAgICRzY29wZS5jYXJkT3B0aW9ucyA9IHtcbiAgICAgICAgZGVidWc6IGZhbHNlLFxuICAgICAgICBmb3JtYXR0aW5nOiB0cnVlXG4gICAgfTtcbiAgICBcbiAgICBDYXJ0U2VydmljZS5nZXRDYXJ0KClcbiAgICAudGhlbihmdW5jdGlvbihjYXJ0KXtcbiAgICAgICAgJHNjb3BlLmNhcnQgPSBjYXJ0O1xuICAgICAgICAkc2NvcGUubGluZUl0ZW1zID0gY2FydC5saW5lSXRlbXM7XG4gICAgfSlcbiAgICAuY2F0Y2goJGxvZy5lcnJvcik7XG5cbiAgICAkc2NvcGUucGxhY2VPcmRlciA9IENoZWNrb3V0U2VydmljZS5wbGFjZU9yZGVyO1xufSk7IiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmFwcC5mYWN0b3J5KCdDaGVja291dFNlcnZpY2UnLCBmdW5jdGlvbigkaHR0cCwgJHN0YXRlKSB7XG4gICAgbGV0IENoZWNrb3V0U2VydmljZSA9IHt9O1xuICAgIFxuICAgIENoZWNrb3V0U2VydmljZS5wbGFjZU9yZGVyID0gZnVuY3Rpb24oY2FydCkge1xuICAgICAgICByZXR1cm4gJGh0dHAucHV0KCcvYXBpL29yZGVycy8nICsgY2FydC5pZCwge1xuICAgICAgICAgICAgc3RhdHVzIDogXCJvcmRlclwiXG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKGZ1bmN0aW9uKG9yZGVyKSB7XG4gICAgICAgICAgICBpZiAob3JkZXIuY29uZmlnLmRhdGEuc3RhdHVzID09IFwib3JkZXJcIikge1xuICAgICAgICAgICAgICAgICRzdGF0ZS5nbyhcImNvbmZpcm1hdGlvblwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKFwibm90IGFuIG9yZGVyIHlldFwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHJldHVybiBDaGVja291dFNlcnZpY2U7XG59KTtcblxuIiwiXCJ1c2Ugc3RyaWN0XCI7XG5cbmFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2NoZWNrb3V0Jywge1xuICAgICAgICB1cmw6ICcvY2hlY2tvdXQnLFxuICAgICAgICB0ZW1wbGF0ZVVybDogJ2pzL2NoZWNrb3V0L2NoZWNrb3V0Lmh0bWwnLFxuICAgICAgICBjb250cm9sbGVyOiAnQ2hlY2tvdXRDdHJsJ1xuICAgIH0pO1xuXG4gICAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ2NvbmZpcm1hdGlvbicsIHtcbiAgICAgICAgdXJsOiAnL2NvbmZpcm1hdGlvbicsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvY2hlY2tvdXQvY29uZmlybWF0aW9uLmh0bWwnXG4gICAgfSk7XG59KTsiLCJhcHAuY29uZmlnKGZ1bmN0aW9uICgkc3RhdGVQcm92aWRlcikge1xuICAgICRzdGF0ZVByb3ZpZGVyLnN0YXRlKCdkb2NzJywge1xuICAgICAgICB1cmw6ICcvZG9jcycsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvZG9jcy9kb2NzLmh0bWwnXG4gICAgfSk7XG59KTtcbiIsIihmdW5jdGlvbiAoKSB7XG5cbiAgICAndXNlIHN0cmljdCc7XG5cbiAgICAvLyBIb3BlIHlvdSBkaWRuJ3QgZm9yZ2V0IEFuZ3VsYXIhIER1aC1kb3kuXG4gICAgaWYgKCF3aW5kb3cuYW5ndWxhcikgdGhyb3cgbmV3IEVycm9yKCdJIGNhblxcJ3QgZmluZCBBbmd1bGFyIScpO1xuXG4gICAgdmFyIGFwcCA9IGFuZ3VsYXIubW9kdWxlKCdmc2FQcmVCdWlsdCcsIFtdKTtcblxuICAgIGFwcC5mYWN0b3J5KCdTb2NrZXQnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICghd2luZG93LmlvKSB0aHJvdyBuZXcgRXJyb3IoJ3NvY2tldC5pbyBub3QgZm91bmQhJyk7XG4gICAgICAgIHJldHVybiB3aW5kb3cuaW8od2luZG93LmxvY2F0aW9uLm9yaWdpbik7XG4gICAgfSk7XG5cbiAgICAvLyBBVVRIX0VWRU5UUyBpcyB1c2VkIHRocm91Z2hvdXQgb3VyIGFwcCB0b1xuICAgIC8vIGJyb2FkY2FzdCBhbmQgbGlzdGVuIGZyb20gYW5kIHRvIHRoZSAkcm9vdFNjb3BlXG4gICAgLy8gZm9yIGltcG9ydGFudCBldmVudHMgYWJvdXQgYXV0aGVudGljYXRpb24gZmxvdy5cbiAgICBhcHAuY29uc3RhbnQoJ0FVVEhfRVZFTlRTJywge1xuICAgICAgICBsb2dpblN1Y2Nlc3M6ICdhdXRoLWxvZ2luLXN1Y2Nlc3MnLFxuICAgICAgICBsb2dpbkZhaWxlZDogJ2F1dGgtbG9naW4tZmFpbGVkJyxcbiAgICAgICAgbG9nb3V0U3VjY2VzczogJ2F1dGgtbG9nb3V0LXN1Y2Nlc3MnLFxuICAgICAgICBzZXNzaW9uVGltZW91dDogJ2F1dGgtc2Vzc2lvbi10aW1lb3V0JyxcbiAgICAgICAgbm90QXV0aGVudGljYXRlZDogJ2F1dGgtbm90LWF1dGhlbnRpY2F0ZWQnLFxuICAgICAgICBub3RBdXRob3JpemVkOiAnYXV0aC1ub3QtYXV0aG9yaXplZCdcbiAgICB9KTtcblxuICAgIGFwcC5mYWN0b3J5KCdBdXRoSW50ZXJjZXB0b3InLCBmdW5jdGlvbiAoJHJvb3RTY29wZSwgJHEsIEFVVEhfRVZFTlRTKSB7XG4gICAgICAgIHZhciBzdGF0dXNEaWN0ID0ge1xuICAgICAgICAgICAgNDAxOiBBVVRIX0VWRU5UUy5ub3RBdXRoZW50aWNhdGVkLFxuICAgICAgICAgICAgNDAzOiBBVVRIX0VWRU5UUy5ub3RBdXRob3JpemVkLFxuICAgICAgICAgICAgNDE5OiBBVVRIX0VWRU5UUy5zZXNzaW9uVGltZW91dCxcbiAgICAgICAgICAgIDQ0MDogQVVUSF9FVkVOVFMuc2Vzc2lvblRpbWVvdXRcbiAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHJlc3BvbnNlRXJyb3I6IGZ1bmN0aW9uIChyZXNwb25zZSkge1xuICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdChzdGF0dXNEaWN0W3Jlc3BvbnNlLnN0YXR1c10sIHJlc3BvbnNlKTtcbiAgICAgICAgICAgICAgICByZXR1cm4gJHEucmVqZWN0KHJlc3BvbnNlKVxuICAgICAgICAgICAgfVxuICAgICAgICB9O1xuICAgIH0pO1xuXG4gICAgYXBwLmNvbmZpZyhmdW5jdGlvbiAoJGh0dHBQcm92aWRlcikge1xuICAgICAgICAkaHR0cFByb3ZpZGVyLmludGVyY2VwdG9ycy5wdXNoKFtcbiAgICAgICAgICAgICckaW5qZWN0b3InLFxuICAgICAgICAgICAgZnVuY3Rpb24gKCRpbmplY3Rvcikge1xuICAgICAgICAgICAgICAgIHJldHVybiAkaW5qZWN0b3IuZ2V0KCdBdXRoSW50ZXJjZXB0b3InKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgXSk7XG4gICAgfSk7XG5cbiAgICBhcHAuc2VydmljZSgnQXV0aFNlcnZpY2UnLCBmdW5jdGlvbiAoJGh0dHAsIFNlc3Npb24sICRyb290U2NvcGUsIEFVVEhfRVZFTlRTLCAkcSkge1xuXG4gICAgICAgIGZ1bmN0aW9uIG9uU3VjY2Vzc2Z1bExvZ2luKHJlc3BvbnNlKSB7XG4gICAgICAgICAgICB2YXIgdXNlciA9IHJlc3BvbnNlLmRhdGEudXNlcjtcbiAgICAgICAgICAgIFNlc3Npb24uY3JlYXRlKHVzZXIpO1xuICAgICAgICAgICAgJHJvb3RTY29wZS4kYnJvYWRjYXN0KEFVVEhfRVZFTlRTLmxvZ2luU3VjY2Vzcyk7XG4gICAgICAgICAgICByZXR1cm4gdXNlcjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFVzZXMgdGhlIHNlc3Npb24gZmFjdG9yeSB0byBzZWUgaWYgYW5cbiAgICAgICAgLy8gYXV0aGVudGljYXRlZCB1c2VyIGlzIGN1cnJlbnRseSByZWdpc3RlcmVkLlxuICAgICAgICB0aGlzLmlzQXV0aGVudGljYXRlZCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGNvbnNvbGUubG9nKCd1c2VyJyk7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhTZXNzaW9uLnVzZXIpO1xuICAgICAgICAgICAgcmV0dXJuICEhU2Vzc2lvbi51c2VyO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuZ2V0TG9nZ2VkSW5Vc2VyID0gZnVuY3Rpb24gKGZyb21TZXJ2ZXIpIHtcblxuICAgICAgICAgICAgLy8gSWYgYW4gYXV0aGVudGljYXRlZCBzZXNzaW9uIGV4aXN0cywgd2VcbiAgICAgICAgICAgIC8vIHJldHVybiB0aGUgdXNlciBhdHRhY2hlZCB0byB0aGF0IHNlc3Npb25cbiAgICAgICAgICAgIC8vIHdpdGggYSBwcm9taXNlLiBUaGlzIGVuc3VyZXMgdGhhdCB3ZSBjYW5cbiAgICAgICAgICAgIC8vIGFsd2F5cyBpbnRlcmZhY2Ugd2l0aCB0aGlzIG1ldGhvZCBhc3luY2hyb25vdXNseS5cblxuICAgICAgICAgICAgLy8gT3B0aW9uYWxseSwgaWYgdHJ1ZSBpcyBnaXZlbiBhcyB0aGUgZnJvbVNlcnZlciBwYXJhbWV0ZXIsXG4gICAgICAgICAgICAvLyB0aGVuIHRoaXMgY2FjaGVkIHZhbHVlIHdpbGwgbm90IGJlIHVzZWQuXG5cbiAgICAgICAgICAgIGlmICh0aGlzLmlzQXV0aGVudGljYXRlZCgpICYmIGZyb21TZXJ2ZXIgIT09IHRydWUpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gJHEud2hlbihTZXNzaW9uLnVzZXIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBNYWtlIHJlcXVlc3QgR0VUIC9zZXNzaW9uLlxuICAgICAgICAgICAgLy8gSWYgaXQgcmV0dXJucyBhIHVzZXIsIGNhbGwgb25TdWNjZXNzZnVsTG9naW4gd2l0aCB0aGUgcmVzcG9uc2UuXG4gICAgICAgICAgICAvLyBJZiBpdCByZXR1cm5zIGEgNDAxIHJlc3BvbnNlLCB3ZSBjYXRjaCBpdCBhbmQgaW5zdGVhZCByZXNvbHZlIHRvIG51bGwuXG4gICAgICAgICAgICByZXR1cm4gJGh0dHAuZ2V0KCcvc2Vzc2lvbicpLnRoZW4ob25TdWNjZXNzZnVsTG9naW4pLmNhdGNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5sb2dpbiA9IGZ1bmN0aW9uIChjcmVkZW50aWFscykge1xuICAgICAgICAgICAgcmV0dXJuICRodHRwLnBvc3QoJy9sb2dpbicsIGNyZWRlbnRpYWxzKVxuICAgICAgICAgICAgICAgIC50aGVuKG9uU3VjY2Vzc2Z1bExvZ2luKVxuICAgICAgICAgICAgICAgIC5jYXRjaChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiAkcS5yZWplY3QoeyBtZXNzYWdlOiAnSW52YWxpZCBsb2dpbiBjcmVkZW50aWFscy4nIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMubG9nb3V0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuICRodHRwLmdldCgnL2xvZ291dCcpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIFNlc3Npb24uZGVzdHJveSgpO1xuICAgICAgICAgICAgICAgICRyb290U2NvcGUuJGJyb2FkY2FzdChBVVRIX0VWRU5UUy5sb2dvdXRTdWNjZXNzKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9O1xuXG4gICAgfSk7XG5cbiAgICBhcHAuc2VydmljZSgnU2Vzc2lvbicsIGZ1bmN0aW9uICgkcm9vdFNjb3BlLCBBVVRIX0VWRU5UUykge1xuXG4gICAgICAgIHZhciBzZWxmID0gdGhpcztcblxuICAgICAgICAkcm9vdFNjb3BlLiRvbihBVVRIX0VWRU5UUy5ub3RBdXRoZW50aWNhdGVkLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBzZWxmLmRlc3Ryb3koKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJHJvb3RTY29wZS4kb24oQVVUSF9FVkVOVFMuc2Vzc2lvblRpbWVvdXQsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHNlbGYuZGVzdHJveSgpO1xuICAgICAgICB9KTtcblxuICAgICAgICB0aGlzLnVzZXIgPSBudWxsO1xuXG4gICAgICAgIHRoaXMuY3JlYXRlID0gZnVuY3Rpb24gKHVzZXIpIHtcbiAgICAgICAgICAgIHRoaXMudXNlciA9IHVzZXI7XG4gICAgICAgIH07XG5cbiAgICAgICAgdGhpcy5kZXN0cm95ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy51c2VyID0gbnVsbDtcbiAgICAgICAgfTtcblxuICAgIH0pO1xuXG59KCkpO1xuIiwiYXBwLmNvbmZpZyhmdW5jdGlvbiAoJHN0YXRlUHJvdmlkZXIpIHtcbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnaG9tZScsIHtcbiAgICAgICAgdXJsOiAnLycsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvaG9tZS9ob21lLmh0bWwnXG4gICAgfSk7XG59KTtcbiIsImFwcC5jb25maWcoZnVuY3Rpb24gKCRzdGF0ZVByb3ZpZGVyKSB7XG5cbiAgICAkc3RhdGVQcm92aWRlci5zdGF0ZSgnbG9naW4nLCB7XG4gICAgICAgIHVybDogJy9sb2dpbicsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvbG9naW4vbG9naW4uaHRtbCcsXG4gICAgICAgIGNvbnRyb2xsZXI6ICdMb2dpbkN0cmwnXG4gICAgfSk7XG5cbn0pO1xuXG5hcHAuY29udHJvbGxlcignTG9naW5DdHJsJywgZnVuY3Rpb24gKCRzY29wZSwgQXV0aFNlcnZpY2UsICRzdGF0ZSkge1xuXG4gICAgJHNjb3BlLmxvZ2luID0ge307XG4gICAgJHNjb3BlLmVycm9yID0gbnVsbDtcblxuICAgICRzY29wZS5zZW5kTG9naW4gPSBmdW5jdGlvbiAobG9naW5JbmZvKSB7XG5cbiAgICAgICAgJHNjb3BlLmVycm9yID0gbnVsbDtcblxuICAgICAgICBBdXRoU2VydmljZS5sb2dpbihsb2dpbkluZm8pLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgJHN0YXRlLmdvKCdob21lJyk7XG4gICAgICAgIH0pLmNhdGNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICRzY29wZS5lcnJvciA9ICdJbnZhbGlkIGxvZ2luIGNyZWRlbnRpYWxzLic7XG4gICAgICAgIH0pO1xuXG4gICAgfTtcblxufSk7XG4iLCJhcHAuY29udHJvbGxlcignUHJvZHVjdHNDdHJsJywgZnVuY3Rpb24oJHNjb3BlLCAkbG9nLCBTZXNzaW9uLCBQcm9kdWN0c1NlcnZpY2UsIENhcnRTZXJ2aWNlKXtcblxuXHRQcm9kdWN0c1NlcnZpY2UuZmluZEFsbCgpXG5cdFx0LnRoZW4oZnVuY3Rpb24ocHJvZHVjdHMpe1xuXHRcdFx0JHNjb3BlLnByb2R1Y3RzID0gcHJvZHVjdHM7XG5cdFx0fSlcblx0XHQuY2F0Y2goJGxvZy5lcnJvcik7XG5cblx0JHNjb3BlLmlzQWRtaW4gPSBmdW5jdGlvbigpe1xuXHRcdGlmIChTZXNzaW9uLnVzZXIpe1xuXHRcdFx0cmV0dXJuIFNlc3Npb24udXNlci5pc0FkbWluO1xuXHRcdH0gcmV0dXJuIGZhbHNlO1xuXHR9O1xuXG5cdCRzY29wZS5jcmVhdGUgPSBmdW5jdGlvbigpe1xuXHRcdFByb2R1Y3RzU2VydmljZS5jcmVhdGUoe1xuXHRcdFx0dGl0bGU6ICRzY29wZS50aXRsZSxcblx0XHRcdGRlc2NyaXB0aW9uOiAkc2NvcGUuZGVzY3JpcHRpb24sXG5cdFx0XHRjYXRlZ29yeTogJHNjb3BlLmNhdGVnb3J5LFxuXHRcdFx0cHJpY2U6ICRzY29wZS5wcmljZSxcblx0XHRcdGludmVudG9yeV9xdHk6ICRzY29wZS5pbnZlbnRvcnksXG5cdFx0XHRwaG90b3M6ICRzY29wZS5waG90b1xuXHRcdH0pXG5cdFx0LnRoZW4oZnVuY3Rpb24oKXtcblx0XHRcdCRzY29wZS50aXRsZSA9ICcnO1xuXHRcdFx0JHNjb3BlLmRlc2NyaXB0aW9uID0gJyc7XG5cdFx0XHQkc2NvcGUuY2F0ZWdvcnkgPSAnJztcblx0XHRcdCRzY29wZS5wcmljZSA9ICcnO1xuXHRcdFx0JHNjb3BlLmludmVudG9yeSA9ICcnO1xuXHRcdFx0JHNjb3BlLnBob3RvID0gJyc7XG5cdFx0fSlcblx0XHQuY2F0Y2goJGxvZy5lcnJvcik7XG5cdH07XG5cblx0JHNjb3BlLmRlc3Ryb3kgPSBmdW5jdGlvbihwcm9kdWN0KXtcblx0XHRQcm9kdWN0c1NlcnZpY2UuZGVzdHJveShwcm9kdWN0KVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24oKXtcblx0XHRcdFx0Y29uc29sZS5sb2coJ3Byb2R1Y3QgZGVsZXRlZCcpO1xuXHRcdFx0fSlcblx0XHRcdC5jYXRjaCgkbG9nLmVycm9yKTtcblx0fTtcblxuXHQkc2NvcGUuaW52ZW50b3J5QXJyYXkgPSBQcm9kdWN0c1NlcnZpY2UuaW52ZW50b3J5QXJyYXk7XG5cblx0Q2FydFNlcnZpY2UuZ2V0Q2FydCgpXG5cdFx0LnRoZW4oZnVuY3Rpb24oY2FydCl7XG5cdFx0XHQkc2NvcGUuY2FydCA9IGNhcnQ7XG5cdFx0fSlcblx0XHQuY2F0Y2goJGxvZy5lcnJvcik7XG5cblx0JHNjb3BlLmFkZFRvQ2FydCA9IGZ1bmN0aW9uKHByb2R1Y3QsIHF1YW50aXR5LCBjYXJ0KXtcblx0XHRDYXJ0U2VydmljZS5jcmVhdGVMaW5lSXRlbShwcm9kdWN0LCBxdWFudGl0eSwgY2FydClcblx0XHQudGhlbihmdW5jdGlvbigpe1xuXHRcdFx0cmV0dXJuIENhcnRTZXJ2aWNlLmdldENhcnQoKTtcblx0XHR9KVxuXHRcdC50aGVuKGZ1bmN0aW9uKGNhcnQpe1xuXHRcdFx0JHNjb3BlLmNhcnQgPSBjYXJ0O1xuXHRcdH0pXG5cdFx0LmNhdGNoKCRsb2cuZXJyb3IpO1xuXHR9O1xuXG59KTtcbiIsIid1c2Ugc3RyaWN0JztcblxuYXBwLmRpcmVjdGl2ZSgnbm90aWZpY2F0aW9uJywgWyckdGltZW91dCcsIGZ1bmN0aW9uICgkdGltZW91dCkge1xuICAgIHJldHVybiB7XG4gICAgICByZXN0cmljOiBcIkVcIixcbiAgICAgIHRlbXBsYXRlOiAnPGRpdiBjbGFzcz1cImFsZXJ0IGFsZXJ0LXN1Y2Nlc3NcIj4gSXRlbSBhZGRlZCB0byBjYXJ0IDwvZGl2PidcbiAgICB9O1xufV0pOyIsImFwcC5mYWN0b3J5KCdQcm9kdWN0c1NlcnZpY2UnLCBmdW5jdGlvbihTZXNzaW9uLCAkaHR0cCl7XG5cblx0dmFyIFByb2R1Y3RzU2VydmljZSA9IHt9O1xuXHR2YXIgX3Byb2R1Y3RzID0gW107XG5cdHZhciBvbmVQcm9kdWN0ID0ge307XG5cdGxldCBjYXJ0ID0gW107XG5cblx0UHJvZHVjdHNTZXJ2aWNlLmZpbmRBbGwgPSBmdW5jdGlvbigpe1xuXHRcdHJldHVybiAkaHR0cC5nZXQoJy9hcGkvcHJvZHVjdHMnKVxuXHRcdCAgLnRoZW4oZnVuY3Rpb24ocHJvZHVjdHMpe1xuXHRcdFx0YW5ndWxhci5jb3B5KHByb2R1Y3RzLmRhdGEsIF9wcm9kdWN0cyk7XG5cdFx0XHRyZXR1cm4gX3Byb2R1Y3RzO1xuXHRcdCAgfSk7XG5cdH07XG5cblx0UHJvZHVjdHNTZXJ2aWNlLmZpbmRPbmUgPSBmdW5jdGlvbihpZCl7XG5cdFx0cmV0dXJuICRodHRwLmdldCgnL2FwaS9wcm9kdWN0cy8nICsgaWQpXG5cdFx0LnRoZW4oZnVuY3Rpb24ocHJvZHVjdCl7XG5cdFx0XHQvLyBjb25zb2xlLmxvZyhwcm9kdWN0LmRhdGEpO1xuXHRcdFx0YW5ndWxhci5jb3B5KHByb2R1Y3QuZGF0YSwgb25lUHJvZHVjdCk7XG5cdFx0XHRyZXR1cm4gb25lUHJvZHVjdDtcblx0XHR9KTtcblx0fTtcblxuXHRQcm9kdWN0c1NlcnZpY2UuY3JlYXRlID0gZnVuY3Rpb24ocHJvZHVjdCl7XG5cdFx0cmV0dXJuICRodHRwLnBvc3QoJy9hcGkvcHJvZHVjdHMnLCBwcm9kdWN0KVxuXHRcdFx0LnRoZW4oZnVuY3Rpb24ocmVzcG9uc2Upe1xuXHRcdFx0XHRfcHJvZHVjdHMucHVzaChyZXNwb25zZS5kYXRhKTtcblx0XHRcdH0pO1xuXHR9O1xuXG5cdFByb2R1Y3RzU2VydmljZS5kZXN0cm95ID0gZnVuY3Rpb24ocHJvZHVjdCl7XG5cdFx0cmV0dXJuICRodHRwLmRlbGV0ZSgnL2FwaS9wcm9kdWN0cy8nICsgcHJvZHVjdC5pZClcblx0XHRcdC50aGVuKGZ1bmN0aW9uKCl7XG5cdFx0XHRcdF9wcm9kdWN0cy5zcGxpY2UoX3Byb2R1Y3RzLmluZGV4T2YocHJvZHVjdCksIDEpO1xuXHRcdFx0fSk7XG5cdH07XG5cblx0UHJvZHVjdHNTZXJ2aWNlLmludmVudG9yeUFycmF5ID0gZnVuY3Rpb24ocHJvZHVjdCl7XG5cdFx0bGV0IGludmVudG9yeUFycmF5ID0gW107XG5cdFx0bGV0IHF1YW50aXR5O1xuXHRcdGlmIChwcm9kdWN0LmludmVudG9yeV9xdHkgPD0gMjUpIHtcblx0XHRcdHF1YW50aXR5ID0gcHJvZHVjdC5pbnZlbnRvcnlfcXR5O1xuXHRcdH0gZWxzZSB7XG5cdFx0XHRxdWFudGl0eSA9IDI1O1xuXHRcdH1cblx0XHRmb3IgKGxldCBpID0gMTsgaSA8PSBxdWFudGl0eTsgaSsrKSB7XG5cdFx0XHRpbnZlbnRvcnlBcnJheS5wdXNoKGkpO1xuXHRcdH1cblx0XHRyZXR1cm4gaW52ZW50b3J5QXJyYXk7XG5cdH07XG5cblx0cmV0dXJuIFByb2R1Y3RzU2VydmljZTtcbn0pO1xuIiwiYXBwLmNvbmZpZyhmdW5jdGlvbigkc3RhdGVQcm92aWRlcil7XG5cblx0JHN0YXRlUHJvdmlkZXJcblx0LnN0YXRlKCdwcm9kdWN0cycsIHtcblx0XHR1cmw6ICcvcHJvZHVjdHMnLFxuXHRcdHRlbXBsYXRlVXJsOiAnanMvcHJvZHVjdHMvcHJvZHVjdHMuaHRtbCcsXG5cdFx0Y29udHJvbGxlcjogJ1Byb2R1Y3RzQ3RybCdcblx0fSlcbiAgICAuc3RhdGUoJ2RldGFpbCcsIHtcblx0XHR1cmw6ICcvcHJvZHVjdHMvOmlkJyxcblx0XHR0ZW1wbGF0ZVVybDogJ2pzL3Byb2R1Y3RzL3Byb2R1Y3RzLWRldGFpbC5odG1sJyxcblx0XHRyZXNvbHZlOiB7XG5cdFx0XHRkZXRhaWxQcm9kdWN0OiBmdW5jdGlvbigkc3RhdGVQYXJhbXMsIFByb2R1Y3RzU2VydmljZSl7XG5cdFx0XHRcdHJldHVybiBQcm9kdWN0c1NlcnZpY2UuZmluZE9uZSgkc3RhdGVQYXJhbXMuaWQpO1xuXHRcdFx0fVxuXHRcdH0sXG5cdFx0Y29udHJvbGxlcjogZnVuY3Rpb24oJHNjb3BlLCBkZXRhaWxQcm9kdWN0LCAkc3RhdGVQYXJhbXMsICRsb2csIENhcnRTZXJ2aWNlLCBQcm9kdWN0c1NlcnZpY2Upe1xuXHRcdFx0JHNjb3BlLnByb2R1Y3QgPSBkZXRhaWxQcm9kdWN0O1xuXHRcdFx0JHNjb3BlLmludmVudG9yeUFycmF5ID0gUHJvZHVjdHNTZXJ2aWNlLmludmVudG9yeUFycmF5KGRldGFpbFByb2R1Y3QpO1xuXHRcdFx0Q2FydFNlcnZpY2UuZ2V0Q2FydCgpXG5cdFx0XHRcdC50aGVuKGZ1bmN0aW9uKGNhcnQpe1xuXHRcdFx0XHRcdCRzY29wZS5jYXJ0ID0gY2FydDtcblx0XHRcdFx0fSlcblx0XHRcdFx0LmNhdGNoKCRsb2cuZXJyb3IpO1xuXHRcdFx0JHNjb3BlLmFkZFRvQ2FydCA9IGZ1bmN0aW9uKHByb2R1Y3QsIHF1YW50aXR5LCBjYXJ0KXtcblx0XHRcdFx0aWYgKCRzY29wZS5jYXJ0KSB7XG5cdFx0XHRcdFx0UHJvZHVjdHNTZXJ2aWNlLmFkZFRvQ2FydChwcm9kdWN0LCBxdWFudGl0eSwgY2FydClcblx0XHRcdFx0XHRcdC50aGVuKClcblx0XHRcdFx0XHRcdC5jYXRjaCgkbG9nLmVycm9yKTtcblx0XHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0XHRQcm9kdWN0c1NlcnZpY2UuYWRkVG9DYXJ0KHByb2R1Y3QsIHF1YW50aXR5LCBjYXJ0KTtcblx0XHRcdFx0fVxuXHRcdFx0fTtcblx0XHR9XG5cdH0pO1xufSk7XG4iLCJhcHAuY29uZmlnKGZ1bmN0aW9uKCRzdGF0ZVByb3ZpZGVyKXtcbiAgJHN0YXRlUHJvdmlkZXIuc3RhdGUoJ3NpZ251cCcsIHtcbiAgICB1cmw6ICcvc2lnbnVwJyxcbiAgICB0ZW1wbGF0ZVVybDogJy9qcy9zaWdudXAvc2lnbnVwLmh0bWwnLFxuICAgIGNvbnRyb2xsZXI6ICdTaWdudXBDdHJsJ1xuICB9KTtcbn0pO1xuXG5hcHAuY29udHJvbGxlcignU2lnbnVwQ3RybCcsIGZ1bmN0aW9uKCRzdGF0ZSwgJHNjb3BlLCBTaWdudXBGYWN0b3J5KXtcblxuICAkc2NvcGUuc2lnblVwID0gZnVuY3Rpb24oKSB7XG4gICAgU2lnbnVwRmFjdG9yeS5zaWduVXAoJHNjb3BlLmNyZWRlbnRpYWxzKVxuICAgICAgLnRoZW4oZnVuY3Rpb24oZW1haWwpe1xuICAgICAgICBpZiAoIWVtYWlsKSAkc3RhdGUuZ28oJ2hvbWUnKTtcbiAgICAgICAgJHNjb3BlLkVtYWlsID0gZW1haWw7XG4gICAgICB9KTtcbiAgfVxufSk7XG5cbmFwcC5mYWN0b3J5KCdTaWdudXBGYWN0b3J5JywgZnVuY3Rpb24oJGh0dHApe1xuICBsZXQgc2lnblVwT2JqID0ge307XG5cbiAgc2lnblVwT2JqLmVtYWlsID0gbnVsbDtcblxuICBzaWduVXBPYmouc2lnblVwID0gZnVuY3Rpb24oY3JlZGVudGlhbHMpIHtcbiAgICByZXR1cm4gJGh0dHAucG9zdCgnL2FwaS9zaWdudXAnLCBjcmVkZW50aWFscylcbiAgICAgIC50aGVuKGZ1bmN0aW9uKHVzZXIpIHtcbiAgICAgICBzaWduVXBPYmouZW1haWwgPSB1c2VyLmRhdGEuZW1haWw7XG4gICAgICAgcmV0dXJuIHNpZ25VcE9iai5lbWFpbDtcbiAgICAgIH0pXG4gIH1cblxuICByZXR1cm4gc2lnblVwT2JqO1xufSk7XG4iLCJhcHAuZmFjdG9yeSgnRnVsbHN0YWNrUGljcycsIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gW1xuICAgICAgICAnaHR0cHM6Ly9wYnMudHdpbWcuY29tL21lZGlhL0I3Z0JYdWxDQUFBWFFjRS5qcGc6bGFyZ2UnLFxuICAgICAgICAnaHR0cHM6Ly9mYmNkbi1zcGhvdG9zLWMtYS5ha2FtYWloZC5uZXQvaHBob3Rvcy1hay14YXAxL3QzMS4wLTgvMTA4NjI0NTFfMTAyMDU2MjI5OTAzNTkyNDFfODAyNzE2ODg0MzMxMjg0MTEzN19vLmpwZycsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQi1MS1VzaElnQUV5OVNLLmpwZycsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQjc5LVg3b0NNQUFrdzd5LmpwZycsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQi1VajlDT0lJQUlGQWgwLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQjZ5SXlGaUNFQUFxbDEyLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0UtVDc1bFdBQUFtcXFKLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0V2WkFnLVZBQUFrOTMyLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0VnTk1lT1hJQUlmRGhLLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0VReUlETldnQUF1NjBCLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0NGM1Q1UVc4QUUybEdKLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0FlVnc1U1dvQUFBTHNqLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0FhSklQN1VrQUFsSUdzLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0FRT3c5bFdFQUFZOUZsLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQi1PUWJWckNNQUFOd0lNLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQjliX2Vyd0NZQUF3UmNKLnBuZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQjVQVGR2bkNjQUVBbDR4LmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQjRxd0MwaUNZQUFsUEdoLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQjJiMzN2UklVQUE5bzFELmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQndwSXdyMUlVQUF2TzJfLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQnNTc2VBTkNZQUVPaEx3LmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0o0dkxmdVV3QUFkYTRMLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0k3d3pqRVZFQUFPUHBTLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0lkSHZUMlVzQUFubkhWLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0dDaVBfWVdZQUFvNzVWLmpwZzpsYXJnZScsXG4gICAgICAgICdodHRwczovL3Bicy50d2ltZy5jb20vbWVkaWEvQ0lTNEpQSVdJQUkzN3F1LmpwZzpsYXJnZSdcbiAgICBdO1xufSk7XG4iLCJhcHAuZmFjdG9yeSgnUmFuZG9tR3JlZXRpbmdzJywgZnVuY3Rpb24gKCkge1xuXG4gICAgdmFyIGdldFJhbmRvbUZyb21BcnJheSA9IGZ1bmN0aW9uIChhcnIpIHtcbiAgICAgICAgcmV0dXJuIGFycltNYXRoLmZsb29yKE1hdGgucmFuZG9tKCkgKiBhcnIubGVuZ3RoKV07XG4gICAgfTtcblxuICAgIHZhciBncmVldGluZ3MgPSBbXG4gICAgICAgICdIZWxsbywgd29ybGQhJyxcbiAgICAgICAgJ0F0IGxvbmcgbGFzdCwgSSBsaXZlIScsXG4gICAgICAgICdIZWxsbywgc2ltcGxlIGh1bWFuLicsXG4gICAgICAgICdXaGF0IGEgYmVhdXRpZnVsIGRheSEnLFxuICAgICAgICAnSVxcJ20gbGlrZSBhbnkgb3RoZXIgcHJvamVjdCwgZXhjZXB0IHRoYXQgSSBhbSB5b3Vycy4gOiknLFxuICAgICAgICAnVGhpcyBlbXB0eSBzdHJpbmcgaXMgZm9yIExpbmRzYXkgTGV2aW5lLicsXG4gICAgICAgICfjgZPjgpPjgavjgaHjga/jgIHjg6bjg7zjgrbjg7zmp5jjgIInLFxuICAgICAgICAnV2VsY29tZS4gVG8uIFdFQlNJVEUuJyxcbiAgICAgICAgJzpEJyxcbiAgICAgICAgJ1llcywgSSB0aGluayB3ZVxcJ3ZlIG1ldCBiZWZvcmUuJyxcbiAgICAgICAgJ0dpbW1lIDMgbWlucy4uLiBJIGp1c3QgZ3JhYmJlZCB0aGlzIHJlYWxseSBkb3BlIGZyaXR0YXRhJyxcbiAgICAgICAgJ0lmIENvb3BlciBjb3VsZCBvZmZlciBvbmx5IG9uZSBwaWVjZSBvZiBhZHZpY2UsIGl0IHdvdWxkIGJlIHRvIG5ldlNRVUlSUkVMIScsXG4gICAgXTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIGdyZWV0aW5nczogZ3JlZXRpbmdzLFxuICAgICAgICBnZXRSYW5kb21HcmVldGluZzogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgcmV0dXJuIGdldFJhbmRvbUZyb21BcnJheShncmVldGluZ3MpO1xuICAgICAgICB9XG4gICAgfTtcblxufSk7XG4iLCJhcHAuZGlyZWN0aXZlKCdmdWxsc3RhY2tMb2dvJywgZnVuY3Rpb24gKCkge1xuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgIHRlbXBsYXRlVXJsOiAnanMvY29tbW9uL2RpcmVjdGl2ZXMvZnVsbHN0YWNrLWxvZ28vZnVsbHN0YWNrLWxvZ28uaHRtbCdcbiAgICB9O1xufSk7XG4iLCJhcHAuZGlyZWN0aXZlKCduYXZiYXInLCBmdW5jdGlvbiAoJHJvb3RTY29wZSwgQXV0aFNlcnZpY2UsIEFVVEhfRVZFTlRTLCAkc3RhdGUpIHtcblxuICAgIHJldHVybiB7XG4gICAgICAgIHJlc3RyaWN0OiAnRScsXG4gICAgICAgIHNjb3BlOiB7fSxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9jb21tb24vZGlyZWN0aXZlcy9uYXZiYXIvbmF2YmFyLmh0bWwnLFxuICAgICAgICBsaW5rOiBmdW5jdGlvbiAoc2NvcGUpIHtcblxuICAgICAgICAgICAgc2NvcGUuaXRlbXMgPSBbXG4gICAgICAgICAgICAgICAgeyBsYWJlbDogJ0hvbWUnLCBzdGF0ZTogJ2hvbWUnIH0sXG4gICAgICAgICAgICAgICAgeyBsYWJlbDogJ1Byb2R1Y3RzJywgc3RhdGU6ICdwcm9kdWN0cycgfSxcbiAgICAgICAgICAgICAgICB7IGxhYmVsOiAnQWJvdXQnLCBzdGF0ZTogJ2Fib3V0JyB9LFxuICAgICAgICAgICAgICAgIHsgbGFiZWw6ICdBY2NvdW50Jywgc3RhdGU6ICdhY2NvdW50J30sXG4gICAgICAgICAgICAgICAgeyBsYWJlbDogJ0NhcnQnLCBzdGF0ZTogJ2NhcnQnfVxuICAgICAgICAgICAgXTtcblxuICAgICAgICAgICAgc2NvcGUudXNlciA9IG51bGw7XG5cbiAgICAgICAgICAgIHNjb3BlLmlzTG9nZ2VkSW4gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEF1dGhTZXJ2aWNlLmlzQXV0aGVudGljYXRlZCgpO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgc2NvcGUubG9nb3V0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIEF1dGhTZXJ2aWNlLmxvZ291dCgpLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICRzdGF0ZS5nbygnaG9tZScpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgdmFyIHNldFVzZXIgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgQXV0aFNlcnZpY2UuZ2V0TG9nZ2VkSW5Vc2VyKCkudGhlbihmdW5jdGlvbiAodXNlcikge1xuICAgICAgICAgICAgICAgICAgICBzY29wZS51c2VyID0gdXNlcjtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH07XG5cbiAgICAgICAgICAgIHZhciByZW1vdmVVc2VyID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHNjb3BlLnVzZXIgPSBudWxsO1xuICAgICAgICAgICAgfTtcblxuICAgICAgICAgICAgc2V0VXNlcigpO1xuXG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRvbihBVVRIX0VWRU5UUy5sb2dpblN1Y2Nlc3MsIHNldFVzZXIpO1xuICAgICAgICAgICAgJHJvb3RTY29wZS4kb24oQVVUSF9FVkVOVFMubG9nb3V0U3VjY2VzcywgcmVtb3ZlVXNlcik7XG4gICAgICAgICAgICAkcm9vdFNjb3BlLiRvbihBVVRIX0VWRU5UUy5zZXNzaW9uVGltZW91dCwgcmVtb3ZlVXNlcik7XG5cbiAgICAgICAgfVxuXG4gICAgfTtcblxufSk7XG4iLCJhcHAuZGlyZWN0aXZlKCdyYW5kb0dyZWV0aW5nJywgZnVuY3Rpb24gKFJhbmRvbUdyZWV0aW5ncykge1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgcmVzdHJpY3Q6ICdFJyxcbiAgICAgICAgdGVtcGxhdGVVcmw6ICdqcy9jb21tb24vZGlyZWN0aXZlcy9yYW5kby1ncmVldGluZy9yYW5kby1ncmVldGluZy5odG1sJyxcbiAgICAgICAgbGluazogZnVuY3Rpb24gKHNjb3BlKSB7XG4gICAgICAgICAgICBzY29wZS5ncmVldGluZyA9IFJhbmRvbUdyZWV0aW5ncy5nZXRSYW5kb21HcmVldGluZygpO1xuICAgICAgICB9XG4gICAgfTtcblxufSk7XG4iXX0=
