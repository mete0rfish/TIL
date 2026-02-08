const app = Vue.createApp({
    data() {
        return {
            number: 0
        }
    },
    watch: {
        result() {
            const that = this;
            setTimeout(function() {
                that.result = 0;
            }, 5000);
        }
    },
    computed: {
        result() {
            if(this.result < 37) {
                return 'Not there yet!';
            } else if(this.result === 37) {
                return this.result;
            } else {
                return 'Too much';
            }
        }
    },
    methods: {
        add(num) {
            this.result += num;
        }
    }
})

app.mount("#assignment");