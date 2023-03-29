//Create shadow session on legacy FR

/**
 * Script configuration
*/
var config = {
    /**
     * @property {string} frUrl - ESV referencing the URL of the legacy FR deployment
     * @property {string} frDomain - ESV referencing the domain to set the legacy cookie against
     * @property {string} realm - ESV referencing the legacy FR deployment realm
     * @property {string} service - ESV referencing the legacy FR login Journey or Chain
     * @property {string} nodeName - The name of the executing node, used for logging
     * 
     */
    frUrl: "esv.legacy.fr.url",
    frDomain: "esv.legacy.fr.domain",
    frRealm: "esv.legacy.fr.realm",
    frService: "esv.legacy.fr.service",
    frCookieName: "esv.legacy.fr.cookie",
    nodeName: "***set-legacy-fr-cookie"
};

/**
 * Add the node info prefix to a log message
 * @param {string} message - the message body
 * @returns a tagged version of the message
 */
function tag(message) {
    return "***".concat(config.nodeName).concat(": ").concat(message);
}

logger.message(tag("Starting Set Cookie Config Provider Script"));

//Set ESVs to variables
var url = systemEnv.getProperty(config.frUrl);
var domain = systemEnv.getProperty(config.frDomain);
var realm = systemEnv.getProperty(config.frRealm);
var service = systemEnv.getProperty(config.frService);
var cookieName = systemEnv.getProperty(config.frCookieName);

logger.message(tag("Legacy FR target is here: " + url));
logger.message(tag("Cookie will be set against this domain: " + domain));
logger.message(tag("Legacy FR realm is: " + realm));
logger.message(tag("Legacy FR login Journey or Chain is: " + service));
logger.message(tag("Legacy FR cookie name is: " + cookieName));

var request = new org.forgerock.http.protocol.Request();
request.setUri("https://"+url+"/am/json/realms/root/realms/"+realm+"/authenticate?authIndexType=service&authIndexValue="+service);
request.setMethod("POST");
request.getHeaders().add("X-OpenAM-Username", nodeState.get("username").asString());
request.getHeaders().add("X-OpenAM-Password", nodeState.get("password").asString());
request.getHeaders().add("Accept-API-Version", "resource=2.0, protocol=1.0");
request.getHeaders().add("Content-Type", "application/json");
var response = httpClient.send(request).get();

var legacyResponse = response.getEntity().getJson();
logger.message(tag("Response from: " + url + ": " + legacyResponse));

//Setting configuration for Set Cookie node
//Some scenarios may require sameSite set to NONE
config = {
    "name": cookieName,
    "value": (legacyResponse.tokenId)?legacyResponse.tokenId:"Error getting legacy token",
    "domain": domain,
    "path": "/",
    "useSecureCookie": true,
    "useHttpOnlyCookie": true,
    "sameSite": "LAX"
};