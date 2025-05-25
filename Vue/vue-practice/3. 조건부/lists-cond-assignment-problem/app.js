const app = Vue.createApp({
    data() {
        return {
            tasks: [],
            enteredTask: '',
            show: false
        }
    },
    methods: {
        addTask(task) {
            this.tasks.push(task);
            console.log(this.tasks);
        },
        triggerShow() {
            this.show = !this.show;
        }
    }
})

app.mount('#assignment');