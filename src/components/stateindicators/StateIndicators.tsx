import MicOff from '@mui/icons-material/MicOff';
import RaiseHand from '@mui/icons-material/BackHand';
import VolumeOff from '@mui/icons-material/VolumeOff';
import { usePeer, usePeerConsumers } from '../../store/hooks';

interface StateIndicatorsProps {
	peerId: string;
}

const StateIndicators = ({ peerId }: StateIndicatorsProps): JSX.Element => {
	const peer = usePeer(peerId);
	const { micConsumer } = usePeerConsumers(peerId);

	// hivework

	return (
		<>
			{ (!micConsumer || micConsumer?.remotePaused) && <MicOff color='error' fontSize='small' /> }
			{ micConsumer?.localPaused && <VolumeOff color='error' fontSize='small' /> }
			{ peer?.raisedHand && <RaiseHand fontSize='small' /> }
			<span>x: { peer?.hivePosition?.x }, y: { peer?.hivePosition?.y }</span>
		</>
	);
};

export default StateIndicators;
