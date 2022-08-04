module.exports = {
  extends: [
    // add more generic rulesets here, such as:
    // 'eslint:recommended',
    'plugin:vue/vue3-recommended',
    // 'plugin:vue/recommended' // Use this if you are using Vue.js 2.x.
  ],
  rules: {
    // override/add rules settings here, such as:
    'vue/no-unused-vars': 'warn',
    'no-console': "warn",// process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': "warn"//process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    
  }
}