export default {
    name:'login',
    init:{
        name:null,
        age:null
    },
    effects:{
        async login({name,pass},{state,setState,select}){
            return new Promise((resolve) => {
                setTimeout(() => {resolve('success')},1000);
            })
        }
    }
}