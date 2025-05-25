const app = Vue.createApp({
    data() {
        return {
            output: ''
        };
    },
    methods: {
        say(message) {
            alert(message);
        },
        write(event) {
            this.output = event.target.value;
        }
    }
});

app.mount('#assignment');