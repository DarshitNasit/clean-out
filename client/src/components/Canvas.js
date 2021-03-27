import React, { useState, useEffect, useRef, useCallback } from "react";
import { dataURLtoFile } from "../utilities/Image";

function Canvas({ captureImage }) {
	const videoPlayerRef = useRef(null);
	const [isCaptured, setIsCaptured] = useState(false);

	useEffect(() => {
		navigator.mediaDevices
			.getUserMedia({
				audio: false,
				video: true,
			})
			.then((stream) => {
				window.localStream = stream;
				videoPlayerRef.current.srcObject = stream;
				videoPlayerRef.current.play();
			})
			.catch((err) => {
				console.log(err);
			});

		return () => {
			window.localStream.getVideoTracks()[0].stop();
		};
	}, []);

	const takePhoto = useCallback(() => {
		setIsCaptured(true);
		const canvas = document.createElement("canvas");
		canvas.width = videoPlayerRef.current.width;
		canvas.height = videoPlayerRef.current.height;

		const context = canvas.getContext("2d");
		context.drawImage(videoPlayerRef.current, 0, 0, 480, 360);
		const file = dataURLtoFile(canvas.toDataURL("image/jpeg"), "temp.jpeg");
		captureImage(file);
	}, [captureImage]);

	return (
		<div className="canvas">
			<video ref={videoPlayerRef} width="480" height="360" />
			<button className="btn btn-black mt-10" onClick={takePhoto}>
				Take photo!
			</button>
			{isCaptured && <p>Captured</p>}
		</div>
	);
}

export default Canvas;
