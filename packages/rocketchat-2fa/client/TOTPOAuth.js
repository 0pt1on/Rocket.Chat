/* globals createOAuthTotpLoginMethod, overrideLoginMethod, convertError, OAuth, Facebook, Github, Twitter, LinkedIn, MeteorDeveloperAccounts*/

Accounts.oauth.tryLoginAfterPopupClosed = function(credentialToken, callback, totpCode) {
	const credentialSecret = OAuth._retrieveCredentialSecret(credentialToken) || null;
	const methodArgument = { oauth: {
		credentialToken,
		credentialSecret,
	} };

	if (totpCode && typeof totpCode === 'string') {
		methodArgument.totp = {
			code : totpCode,
		};
	}

	Accounts.callLoginMethod({
		methodArguments: [methodArgument],
		userCallback: callback && function(err) {
			callback(convertError(err));
		} });
};

Accounts.oauth.credentialRequestCompleteHandler = function(callback, totpCode) {
	return function(credentialTokenOrError) {
		if (credentialTokenOrError && credentialTokenOrError instanceof Error) {
			callback && callback(credentialTokenOrError);
		} else {
			Accounts.oauth.tryLoginAfterPopupClosed(credentialTokenOrError, callback, totpCode);
		}
	};
};

const {
	loginWithFacebook,
	loginWithGithub,
	loginWithMeteorDeveloperAccount,
	loginWithTwitter,
	loginWithLinkedin,
} = Meteor;

const loginWithFacebookAndTOTP = createOAuthTotpLoginMethod(() => Facebook);
Meteor.loginWithFacebook = function(options, cb) {
	overrideLoginMethod(loginWithFacebook, [options], cb, loginWithFacebookAndTOTP);
};

const loginWithGithubAndTOTP = createOAuthTotpLoginMethod(() => Github);
Meteor.loginWithGithub = function(options, cb) {
	overrideLoginMethod(loginWithGithub, [options], cb, loginWithGithubAndTOTP);
};

const loginWithMeteorDeveloperAccountAndTOTP = createOAuthTotpLoginMethod(() => MeteorDeveloperAccounts);
Meteor.loginWithMeteorDeveloperAccount = function(options, cb) {
	overrideLoginMethod(loginWithMeteorDeveloperAccount, [options], cb, loginWithMeteorDeveloperAccountAndTOTP);
};

const loginWithTwitterAndTOTP = createOAuthTotpLoginMethod(() => Twitter);
Meteor.loginWithTwitter = function(options, cb) {
	overrideLoginMethod(loginWithTwitter, [options], cb, loginWithTwitterAndTOTP);
};

const loginWithLinkedinAndTOTP = createOAuthTotpLoginMethod(() => LinkedIn);
Meteor.loginWithLinkedin = function(options, cb) {
	overrideLoginMethod(loginWithLinkedin, [options], cb, loginWithLinkedinAndTOTP);
};
