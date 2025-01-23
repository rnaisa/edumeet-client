import { useState } from 'react';
import { useAppSelector } from '../../store/hooks';
import { spotlightWebcamConsumerSelector } from '../../store/selectors';
import Me from '../me/Me';
import VideoConsumer from '../videoconsumer/VideoConsumer';
import Peers from '../peers/Peers';
import './democratic.css';

const Democratic = (): JSX.Element => {

	const webcamConsumers = useAppSelector(spotlightWebcamConsumerSelector);

	const [ dimensions ] = useState<Record<'peerWidth' | 'peerHeight', number>>({ peerWidth: 320, peerHeight: 240 });

	const style = {
		width: dimensions.peerWidth,
		height: dimensions.peerHeight
	};

	return (
		<div className='video-grid'>
			<Me style={style} />
			{ webcamConsumers.map((consumer) => (
				<VideoConsumer
					key={consumer.id}
					consumer={consumer}
					style={style}
				/>
			))}
			<Peers style={style} />
		</div>
	);
};

export default Democratic;
