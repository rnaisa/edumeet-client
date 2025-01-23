import MicOff from '@mui/icons-material/MicOff';
import RaiseHand from '@mui/icons-material/BackHand';
import { useAppSelector } from '../../store/hooks';

const MeStateIndicators = (): JSX.Element => {
	const audioMuted = useAppSelector((state) => state.me.audioMuted);
	const micEnabled = useAppSelector((state) => state.me.micEnabled);
	const raisedHand = useAppSelector((state) => state.me.raisedHand);
	const hivePosition = useAppSelector((state) => state.me.hivePosition);

	const muted = (micEnabled && audioMuted) || !micEnabled;

	// hivework

	return (
		<>
			{ muted && <MicOff color='error' fontSize='small' /> }
			{ raisedHand && <RaiseHand fontSize='small' /> }
			<span>x: { hivePosition.x }, y: { hivePosition.y }</span>
		</>
	);
};

export default MeStateIndicators;
