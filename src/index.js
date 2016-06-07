/*!
 * Copyright (c) 2016 Nanchao Inc.
 * All rights reserved.
 */

'use strict';

var driver = require('ruff-driver');

var hasOwnProperty = Object.prototype.hasOwnProperty;

var OUTPUT_INDEX_MAP = {
    'gpio-0': 0,
    'gpio-1': 1,
    'gpio-2': 2,
    'gpio-3': 3,
    'gpio-4': 4,
    'gpio-5': 5,
    'gpio-6': 6,
    'gpio-7': 7
};

function I2cGpioInterface(device, index) {
    this._device = device;
    this._index = index;
}

I2cGpioInterface.prototype.write = function (value) {
    this._device.write(this._index, value);
};

I2cGpioInterface.prototype.read = function () {
    return this._device.read(this._index);
};

module.exports = driver({
    attach: function (inputs) {
        this._i2c = inputs['i2c'];
        this._data = 0;
    },

    getInterface: function (name) {
        if (!hasOwnProperty.call(OUTPUT_INDEX_MAP, name)) {
            throw new Error('Invalid interface name "' + name + '"');
        }

        var index = OUTPUT_INDEX_MAP[name];

        return new I2cGpioInterface(this, index);
    },

    exports: {
        write: function (index, value) {
            var data = 0;

            if (value === 1) {
                data = this._data | (1 << index);
            } else {
                data = this._data & ~(1 << index);
            }

            if (data !== this._data) {
                this._i2c.writeByte(-1, data);
                this._data = data;
            }

            return data;
        },
        read: function (index) {
            var data = this._i2c.readByte();
            return (data & (1 << index)) >> index;
        }
    }
});
