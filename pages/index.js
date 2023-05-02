import { useState } from "react";
import Head from "next/head";
import Image from "next/image";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export default function Home() {
      const [prediction, setPrediction] = useState(null);
      const [error, setError] = useState(null);
      const [guidanceScale, setGuidanceScale] = useState(7);
      const [num_inference_steps, setnum_inference_steps] = useState(50);

      const handleSubmit = async (e) => {
            e.preventDefault();
            const response = await fetch("/api/predictions", {
                  method: "POST",
                  headers: {
                        "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                        a_prompt: "best quality, extremely detailed",
                        ddim_steps: 20,
                        detect_resolution: 512,
                        image_resolution: "512",
                        n_prompt: "ongbody, lowres, bad anatomy, bad hands, missing fingers, extra digit, fewer digits, cropped, worst quality, low quality",
                        num_samples: "1",
                        scale: 9,
                        image: e.target.image.value,
                        prompt: e.target.prompt.value,
                        // guidance_scale: e.target.guidance_scale.value,
                        // num_inference_steps: e.target.num_inference_steps.value,
                  }),
            });
            let prediction = await response.json();
            if (response.status !== 201) {
                  setError(prediction.detail);
                  return;
            }
            setPrediction(prediction);
            while (
                  prediction.status !== "succeeded" &&
                  prediction.status !== "failed"
            ) {
                  await sleep(1000);
                  const response = await fetch(
                        "/api/predictions/" + prediction.id
                  );
                  prediction = await response.json();
                  if (response.status !== 200) {
                        setError(prediction.detail);
                        return;
                  }
                  console.log({ prediction });
                  setPrediction(prediction);
            }
      };

      return (
            <div className="container max-w-2xl mx-auto p-5">
                  <Head>
                        <title>Demo</title>
                  </Head>

                  {/* <h1 className="py-6 text-center font-bold text-2xl">
                        Dream something with{" "}
                        <a href="https://replicate.com/stability-ai/stable-diffusion">
                              Stable Diffusion
                        </a>
                  </h1> */}

                  <form
                        className="w-full flex flex-col gap-10"
                        onSubmit={handleSubmit}
                  >
                        <input
                              type="text"
                              className="flex-grow"
                              name="image"
                              placeholder="url image"
                        />
                        <input
                              type="text"
                              className="flex-grow"
                              name="prompt"
                              placeholder="Enter a prompt to display an image"
                        />
                        <input
                              type="text"
                              className="hidden"
                              name="guidance_scale"
                              value={guidanceScale}
                              readOnly
                              placeholder="Enter a prompt to display an image"
                        />
                        <input
                              type="text"
                              className="hidden"
                              name="num_inference_steps"
                              value={num_inference_steps}
                              readOnly
                              placeholder="Enter a prompt to display an image"
                        />
                        <button className="button" type="submit">
                              Go!
                        </button>
                  </form>

                  {error && <div>{error}</div>}

                  {prediction && (
                        <>
                              {prediction.output && (
                                    <div className="image-wrapper mt-5">
                                          <Image
                                                fill
                                                src={
                                                      prediction.output[
                                                            prediction.output
                                                                  .length - 1
                                                      ]
                                                }
                                                alt="output"
                                                sizes="100vw"
                                          />
                                    </div>
                              )}
                              <p className="py-3 text-sm opacity-50">
                                    status: {prediction.status}
                              </p>
                        </>
                  )}
            </div>
      );
}
