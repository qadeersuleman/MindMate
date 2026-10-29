import { StyleSheet, TextInput, } from "react-native";


const AppInput = ({onChangeText, placeholder, ...props}) => {
    return (
        <TextInput onChangeText={onChangeText} placeholder={placeholder} {...props} />
    )
}

const styles = StyleSheet.create({
    
})


export default AppInput;