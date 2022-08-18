export default function Loader(props) {
    let bigger = props.isBigger;

    return (<>
        <div className={bigger ? "loader-big": "loader"}>
        <div className="inner one"></div>
        <div className="inner two"></div>
        <div className="inner three"></div>
        </div>
        </>)
}