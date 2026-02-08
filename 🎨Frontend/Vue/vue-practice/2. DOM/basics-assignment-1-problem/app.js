const app = Vue.createApp({
    data() {
        return {
            myName: 'Sungwon',
            myAge: 24,
            flowerImage: 'https://www.google.com/url?sa=i&url=https%3A%2F%2Fwww.vecteezy.com%2Ffree-photos%2Fflower&psig=AOvVaw2r54jf0Jot5_3CagZwoi0j&ust=1747550036569000&source=images&cd=vfe&opi=89978449&ved=0CBEQjRxqFwoTCMDm9rnxqY0DFQAAAAAdAAAAABAJ'
        }
    },
    methods: {
        createRandomNumber() {
            return Math.random();
        }
    }
})

app.mount('#assignment');