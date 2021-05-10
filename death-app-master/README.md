## Install prerequisites (macOS)

#### 1. (Optional) Install [nvm](https://github.com/nvm-sh/nvm)
```
touch ~/.bash_profile
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.37.2/install.sh | bash
```
Confirm that the installation was successful
```
nvm --version
```
Install a version of Node 10.15 or higher
```
nvm install 10.15
```
Then in any shell you can switch Node version using
```
nvm use 10.15
```

#### 2. Install yarn globally 
```
brew install yarn
```
Note: Soon we'll likely need to update to yarn 2.x since global yarn installs have entered maintenance mode.<br>

#### 3. Install React Native dependencies<br>
Follow the instructions under [Installing Dependencies](https://reactnative.dev/docs/environment-setup). We do not use Expo, so ensure that you are using the *React Native CLI Quickstart* instructions and select Development OS macOS and select your preferred Target OS.<br>

#### 4. Add Google Services files to the app
The app uses [React Native Firebase](https://rnfirebase.io/) for authentication, which requires two service configuration files to run. 

(Android)
Obtain the `google-services.json` file from a secure source and place it inside of your project at `/android/app/google-services.json`. 

(iOS)
Obtain the `GoogleService-Info.plist` file from a secure source and add the file to the project in Xcode. See the [iOS setup instructions](https://rnfirebase.io/#generating-ios-credentials) for more detailed explanation on how to correctly add this file.  

## Run the app

Install the app dependencies
```
yarn install
```
Install the [Pods](https://guides.cocoapods.org/using/getting-started.html) (iOS)

```
cd ios/ && pod install && cd ../
```

Run the iOS app
```
yarn react-native run-ios
```
or

Run the Android app
```
yarn react-native run-android
```

See the [troubleshooting](https://reactnative.dev/docs/troubleshooting#content) page for known issues and solutions.

## Known issues
1. Android Build error on MacOS Big Sur: `Could not find tools.jar` See https://stackoverflow.com/questions/64968851/could-not-find-tools-jar-please-check-that-library-internet-plug-ins-javaapple
