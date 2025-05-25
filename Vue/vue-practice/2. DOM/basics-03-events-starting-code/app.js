const app = Vue.createApp({
  data() {
    return {
      counter: 0,
      name: '',
      lastName: ''
    };
  },
  watch: {
    counter(value) {
      if (value > 50) {
        const that = this;
        setTimeout(function () {
          that.counter = 0;
        }, 2000);
      }
    }
    // name(value) {
    //   this.fullname = value + ' ';
    // },
    // lastName(value) {
    //   this.lastName = value;
    // }
  },
  computed: {
    fullname() {
      if(this.name === '') {
        return '';
      }

      return this.name + ' ' + this.lastName;
    } 
  },
  methods: {
    confirmInput() {
      this.confirmedName = this.name;
    },
    add(num) {
      this.counter+=num;
    },
    reduce(num) {
      this.counter-=num;
    },
    setName(event, last='님') {
      this.name = event.target.value;
    },
    submitForm(event) {
      alert('Submitted!');
    },
    resetInput() {
      this.name = '';
    },
    outputFullname() {
      if(this.name === '') {
        return '';
      }

      return this.name + ' 님';
    }
  }
});

app.mount('#events');
