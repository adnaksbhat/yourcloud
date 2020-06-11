module.exports = {
    getLocalIPs: function () {
        var addrInfo, ifaceDetails, _len;
        var localIPInfo = {};
        //Get the network interfaces
        var networkInterfaces = require('os').networkInterfaces();
        //Iterate over the network interfaces
        for (var ifaceName in networkInterfaces) {
            ifaceDetails = networkInterfaces[ifaceName];
            //Iterate over all interface details
            for (var _i = 0, _len = ifaceDetails.length; _i < _len; _i++) {
                addrInfo = ifaceDetails[_i];
                if (addrInfo.family === 'IPv4') {
                    //Extract the IPv4 address
                    if (!localIPInfo[ifaceName]) {
                        localIPInfo[ifaceName] = {};
                    }
                    localIPInfo[ifaceName].IPv4 = addrInfo.address;
                } else if (addrInfo.family === 'IPv6') {
                    //Extract the IPv6 address
                    if (!localIPInfo[ifaceName]) {
                        localIPInfo[ifaceName] = {};
                    }
                    localIPInfo[ifaceName].IPv6 = addrInfo.address;
                }
            }
        }
        return localIPInfo;
    }
};