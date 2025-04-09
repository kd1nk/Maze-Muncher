install npm Jest
npm install --save-dev jest babel-jest @babel/core @babel/preset-env
npm install --save-dev jest-environment-jsdom
Add a Babel configuration so Jest can properly parse your files. Create a file called .babelrc:
{
  "presets": ["@babel/preset-env"]
}

In your package.json add a script to run your tests:
"scripts": {
  "test": "jest"
}

Now, you can run your tests using npm test.