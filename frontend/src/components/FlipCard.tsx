// import { useState, useEffect } from "react";
// import { motion } from "motion/react";
// import CardFront from "./card-front";
// import CardBack from "./card-back";

// const FlippingCard = () => {
//   const [isFlipped, setIsFlipped] = useState(false);

//   useEffect(() => {
//     const interval = setInterval(() => {
//       setIsFlipped((prev) => !prev);
//     }, 2000);

//     return () => clearInterval(interval);
//   }, []);

//   return (
//     <motion.div
//       className="card-container"
//       style={{
//         width: "454px",
//         height: "271px",
//         perspective: "1000px", // Adds depth for 3D animation
//       }}
//     >
//       <motion.div
//         className="card"
//         animate={{ rotateY: isFlipped ? 180 : 0 }} // Animates the flip
//         transition={{ duration: 1 }} // Controls the flip speed
//         style={{
//           width: "100%",
//           height: "100%",
//           position: "relative",
//           transformStyle: "preserve-3d", // Enables 3D effect
//         }}
//       >
//         {/* Front Side */}
//         <motion.div
//           className="card-front"
//           style={{
//             position: "absolute",
//             backfaceVisibility: "hidden", // Ensures only one side is visible
//             width: "100%",
//             height: "100%",
//             display: "flex",
//             justifyContent: "center",
//             alignItems: "center",
//           }}
//         >
//           <CardFront />
//         </motion.div>

//         {/* Back Side */}
//         <motion.div
//           className="card-back"
//           style={{
//             position: "absolute",
//             backfaceVisibility: "hidden",
//             transform: "rotateY(180deg)", // Flips the back face
//             width: "100%",
//             height: "100%",
//             display: "flex",
//             justifyContent: "center",
//             alignItems: "center",
//           }}
//         >
//           <CardBack />
//         </motion.div>
//       </motion.div>
//     </motion.div>
//   );
// };

// export default FlippingCard;
