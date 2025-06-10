const app = Vue.createApp({
    data() {
        return {
            friends: [
                {
                    id: 'manuel',
                    name: 'Manuel Lorenz',
                    phone: '01234 56789',
                    email: 'manuel@gmail.com'
                },
                {
                    id: 'julie',
                    name: 'Julie Jones',
                    phone: '98765 43210',
                    email: 'julie@gmail.com'
                }
            ]
        };
    }
})

app.component('friend-contact', {
    template: `
        <li>
          <h2>{{ friends.name }}</h2>
          <button @click="toggleDetails()">Show Details</button>
          <ul>
            <li><strong>Phone:</strong> {{ friends.phone }} </li>
            <li><strong>Email:</strong> {{ friends.email }}</li>
          </ul>
        </li>
    `,
    data() {
        return {
            detailsAreVisible: flase
        };
    },
    methods: {
        toggleDetails() {
            this.detailsAreVisible = !this.detailsAreVisible;
        }
    }
});

app.mount('#app');