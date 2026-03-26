import { configureStore } from "@reduxjs/toolkit";
import userSlice from './userSlice'

const makeStore = ()=>{
    return configureStore({
        reducer:{
            user: userSlice.reducer
        }
    })
}


export default makeStore;