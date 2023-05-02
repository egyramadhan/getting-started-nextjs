import Replicate from "replicate";

const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
});

export default async function handler(req, res) {
      if (!process.env.REPLICATE_API_TOKEN) {
            throw new Error(
                  "The REPLICATE_API_TOKEN environment variable is not set. See README.md for instructions on how to set it."
            );
      }
      console.log(req.body);

      const prediction = await replicate.predictions.create({
            // Pinned to a specific version of Stable Diffusion
            // See https://replicate.com/stability-ai/stable-diffusion/versions
            version: "cc8066f617b6c99fdb134bc1195c5291cf2610875da4985a39de50ee1f46d81c",

            // This is the text prompt that will be submitted by a form on the frontend
            input: { image: req.body.image, prompt: req.body.prompt },
      });

      if (prediction?.error) {
            res.statusCode = 500;
            res.end(JSON.stringify({ detail: prediction.error }));
            return;
      }

      res.statusCode = 201;
      res.end(JSON.stringify(prediction));
}
