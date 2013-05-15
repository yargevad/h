/*
** Annotator 1.2.6-dev-1545e1b
** https://github.com/okfn/annotator/
**
** Copyright 2012 Aron Carroll, Rufus Pollock, and Nick Stenning.
** Dual licensed under the MIT and GPLv3 licenses.
** https://github.com/okfn/annotator/blob/master/LICENSE
**
** Built at: 2013-05-15 16:54:36Z
*/

(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; },
    __hasProp = Object.prototype.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor; child.__super__ = parent.prototype; return child; };

  Annotator.Plugin.Permissions = (function(_super) {

    __extends(Permissions, _super);

    Permissions.prototype.events = {
      'beforeAnnotationCreated': 'addFieldsToAnnotation'
    };

    Permissions.prototype.options = {
      showViewPermissionsCheckbox: true,
      showEditPermissionsCheckbox: true,
      userId: function(user) {
        return user;
      },
      userString: function(user) {
        return user;
      },
      userAuthorize: function(action, annotation, user) {
        var token, tokens, _i, _len;
        if (annotation.permissions) {
          tokens = annotation.permissions[action] || [];
          if (tokens.length === 0) return true;
          for (_i = 0, _len = tokens.length; _i < _len; _i++) {
            token = tokens[_i];
            if (this.userId(user) === token) return true;
          }
          return false;
        } else if (annotation.user) {
          return user && this.userId(user) === this.userId(annotation.user);
        }
        return true;
      },
      user: '',
      permissions: {
        'read': [],
        'update': [],
        'delete': [],
        'admin': []
      }
    };

    function Permissions(element, options) {
      this._setAuthFromToken = __bind(this._setAuthFromToken, this);
      this.updateViewer = __bind(this.updateViewer, this);
      this.updateAnnotationPermissions = __bind(this.updateAnnotationPermissions, this);
      this.updatePermissionsField = __bind(this.updatePermissionsField, this);
      this.addFieldsToAnnotation = __bind(this.addFieldsToAnnotation, this);      Permissions.__super__.constructor.apply(this, arguments);
      if (this.options.user) {
        this.setUser(this.options.user);
        delete this.options.user;
      }
    }

    Permissions.prototype.pluginInit = function() {
      var createCallback, self,
        _this = this;
      if (!Annotator.supported()) return;
      self = this;
      createCallback = function(method, type) {
        return function(field, annotation) {
          return self[method].call(self, type, field, annotation);
        };
      };
      if (!this.user && this.annotator.plugins.Auth) {
        this.annotator.plugins.Auth.withToken(this._setAuthFromToken);
      }
      if (this.options.showViewPermissionsCheckbox === true) {
        this.annotator.editor.addField({
          type: 'checkbox',
          label: Annotator._t('Allow anyone to <strong>view</strong> this annotation'),
          load: createCallback('updatePermissionsField', 'read'),
          submit: createCallback('updateAnnotationPermissions', 'read')
        });
      }
      if (this.options.showEditPermissionsCheckbox === true) {
        this.annotator.editor.addField({
          type: 'checkbox',
          label: Annotator._t('Allow anyone to <strong>edit</strong> this annotation'),
          load: createCallback('updatePermissionsField', 'update'),
          submit: createCallback('updateAnnotationPermissions', 'update')
        });
      }
      this.annotator.viewer.addField({
        load: this.updateViewer
      });
      if (this.annotator.plugins.Filter) {
        return this.annotator.plugins.Filter.addFilter({
          label: Annotator._t('User'),
          property: 'user',
          isFiltered: function(input, user) {
            var keyword, _i, _len, _ref;
            user = _this.options.userString(user);
            if (!(input && user)) return false;
            _ref = input.split(/\s*/);
            for (_i = 0, _len = _ref.length; _i < _len; _i++) {
              keyword = _ref[_i];
              if (user.indexOf(keyword) === -1) return false;
            }
            return true;
          }
        });
      }
    };

    Permissions.prototype.setUser = function(user) {
      return this.user = user;
    };

    Permissions.prototype.addFieldsToAnnotation = function(annotation) {
      if (annotation) {
        annotation.permissions = this.options.permissions;
        if (this.user) return annotation.user = this.user;
      }
    };

    Permissions.prototype.authorize = function(action, annotation, user) {
      if (user === void 0) user = this.user;
      if (this.options.userAuthorize) {
        return this.options.userAuthorize.call(this.options, action, annotation, user);
      } else {
        return true;
      }
    };

    Permissions.prototype.updatePermissionsField = function(action, field, annotation) {
      var input;
      field = $(field).show();
      input = field.find('input').removeAttr('disabled');
      if (!this.authorize('admin', annotation)) field.hide();
      if (this.authorize(action, annotation || {}, null)) {
        return input.attr('checked', 'checked');
      } else {
        return input.removeAttr('checked');
      }
    };

    Permissions.prototype.updateAnnotationPermissions = function(type, field, annotation) {
      var dataKey;
      if (!annotation.permissions) {
        annotation.permissions = this.options.permissions;
      }
      dataKey = type + '-permissions';
      if ($(field).find('input').is(':checked')) {
        return annotation.permissions[type] = [];
      } else {
        return annotation.permissions[type] = [this.user];
      }
    };

    Permissions.prototype.updateViewer = function(field, annotation, controls) {
      var user, username;
      field = $(field);
      username = this.options.userString(annotation.user);
      if (annotation.user && username && typeof username === 'string') {
        user = Annotator.$.escape(this.options.userString(annotation.user));
        field.html(user).addClass('annotator-user');
      } else {
        field.remove();
      }
      if (controls) {
        if (!this.authorize('update', annotation)) controls.hideEdit();
        if (!this.authorize('delete', annotation)) return controls.hideDelete();
      }
    };

    Permissions.prototype._setAuthFromToken = function(token) {
      return this.setUser(token.userId);
    };

    return Permissions;

  })(Annotator.Plugin);

}).call(this);
