export const App = {
  // .vue
  render() {
    return h("div","hi, " + this.msg)
  },
  setup() {
    // composition api
    return {
      msg:"mini-vue"
    }
  }
}