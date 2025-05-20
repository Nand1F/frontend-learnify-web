const InputBox = ({ name, type, id, value, placeholder }) => {
    return (
        <input
            name={name}
            type={type}
            placeholder={placeholder}
            defaultValue={value}
            id={id}
            className="input-box"
        ></input>
    )
}
export default InputBox;