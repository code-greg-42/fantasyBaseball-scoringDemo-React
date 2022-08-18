export default function RosterPhoto(props) {
    try {
        return <img src={require('../media_files/roster_pics/' + props.photoUrl)} className="h-32 absolute top-2 left-0" />
    } catch(e) {
        console.log(e);
        return <img src={require('../media_files/roster_pics/no_pfp.png')} className="h-32 absolute top-2 left-0" />
    }
}