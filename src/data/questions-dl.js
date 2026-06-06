export const DL_QUESTIONS = [
  {
    id: "dlq1", courseId: "deep-learning", topicId: "dl-architectures",
    title: "CNN vs RNN vs Transformer", difficulty: "Medium", type: "open-ended", estimatedMinutes: 15,
    prompt: "For each scenario (image classification, time series forecasting, document summarization, audio classification), pick the best architecture and explain the tradeoffs.",
    hints: [
      "CNNs exploit spatial locality — nearby pixels are more related than distant ones",
      "RNNs/LSTMs model sequential dependencies but suffer from vanishing gradients on long sequences",
      "Transformers attend to all positions at once — better for long-range dependencies but quadratic in sequence length",
    ],
    modelAnswer: `**Image classification → CNN**
Spatial locality makes CNNs ideal: convolutional filters detect local patterns (edges → textures → objects) regardless of position. Transformers (ViT) now compete, but CNNs remain more data-efficient on smaller datasets. Tradeoff: CNNs assume spatial hierarchy; they struggle with long-range global relationships that ViT handles natively.

**Time series forecasting → Transformer (or LSTM as baseline)**
For long sequences (hourly data, 1–2 years), Transformers capture long-range dependencies (seasonality, trends) that LSTMs struggle with due to vanishing gradients. Tradeoff: Transformers are O(n²) in sequence length — for very long series, efficient variants (Informer, Autoformer) or patching strategies are needed. LSTMs are still competitive on short sequences and are cheaper to train.

**Document summarization → Transformer (encoder-decoder)**
Summarization requires attending to the full document context, then generating a shorter output — exactly what encoder-decoder Transformers (BART, T5) excel at. LSTMs can't reliably capture context across thousands of tokens. Tradeoff: large transformer models require significant compute; for production, distilled variants or fine-tuned smaller models (e.g. FLAN-T5-base) are preferred.

**Audio classification → CNN on spectrograms (or Transformer)**
Convert raw audio to a mel spectrogram (a 2D time-frequency image), then apply a CNN just like image classification. For longer clips or speech, transformer-based models (Wav2Vec, Whisper) learn directly from raw waveforms. Tradeoff: spectrogram + CNN is simpler and faster to train; raw-waveform transformers are more accurate but need more data.`,
    rubric: [
      "Correct architecture chosen for each scenario",
      "Explains spatial locality reasoning for CNN",
      "Addresses sequence length limitation for RNN vs Transformer",
      "Mentions encoder-decoder structure for summarization",
      "Discusses at least one concrete tradeoff per choice",
      "Shows awareness of compute/data efficiency considerations",
    ],
    tags: ["architecture-selection", "tradeoffs"],
    commonMistakes: ["Recommending RNN for long documents without addressing vanishing gradients", "Claiming CNNs can't do sequences at all (1D-CNNs work well for audio)", "Not mentioning the O(n²) transformer complexity tradeoff"],
  },
  {
    id: "dlq2", courseId: "deep-learning", topicId: "dl-foundations",
    title: "Training Loss Not Decreasing", difficulty: "Medium", type: "open-ended", estimatedMinutes: 15,
    prompt: "Your neural network's training loss is flat after 10 epochs. Walk through a systematic debugging checklist: what could be wrong and what would you try in what order?",
    hints: [
      "Check the basics first: learning rate, data loading, label correctness",
      "Vanishing gradients: gradients near zero early layers = network can't learn",
      "Dead ReLUs: activations all zero after a layer = no signal propagates",
    ],
    modelAnswer: `**Systematic debugging order (most likely → least likely):**

**1. Sanity-check the data (5 min)**
- Print a batch: are inputs normalised? Are labels correct?
- Try training on a single batch of 32 examples. If loss drops to near-zero, data pipeline is fine. If not, the problem is in the model or labels.

**2. Learning rate (most common cause)**
- Too high: loss oscillates or explodes. Too low: loss is flat.
- Try a learning rate range test: sweep from 1e-7 to 1 over 100 steps, plot loss — pick the value just before it starts rising.
- Quick fix: try 1e-3 (Adam default), 1e-4, 1e-2.

**3. Initialisation**
- Poor initialisation causes vanishing/exploding gradients from step 1.
- Use He initialisation for ReLU, Xavier for sigmoid/tanh.
- Print gradient norms per layer: if early layers show near-zero gradients, you have vanishing gradients.

**4. Architecture issues**
- Dead ReLUs: print mean activation per layer. If a layer is all zeros, add batch normalisation before activation or switch to Leaky ReLU.
- Network too deep for your dataset: try a 2-layer version first.

**5. Optimiser / loss function mismatch**
- Cross-entropy for classification (not MSE). MSE loss for regression.
- Are logits vs softmax outputs handled correctly?

**6. Gradient flow**
- Call loss.backward() and check model.parameters() — if any grad is None, that parameter is disconnected from the graph (common when you accidentally use .detach() or numpy conversion mid-forward-pass).

**Summary order:** data → learning rate → initialisation → architecture → loss function → gradient flow.`,
    rubric: [
      "Starts with data sanity check (overfit one batch)",
      "Identifies learning rate as the most common cause",
      "Mentions gradient monitoring (vanishing gradients)",
      "Addresses dead ReLU neurons",
      "Checks loss function / architecture mismatch",
      "Provides concrete diagnostic commands / checks",
    ],
    tags: ["debugging", "training", "practical"],
    commonMistakes: ["Jumping to complex solutions (add layers, change architecture) before checking learning rate", "Not testing on a single batch first", "Ignoring gradient norms — the most informative signal"],
  },
  {
    id: "dlq3", courseId: "deep-learning", topicId: "dl-foundations",
    title: "Implement a Simple Neural Network from Scratch", difficulty: "Hard", type: "code", language: "python", estimatedMinutes: 30,
    prompt: "Build a 2-layer neural network using only NumPy. Implement forward pass, backprop, and training loop. Train it on a simple classification task.",
    hints: [
      "Forward: Z1 = X·W1 + b1, A1 = relu(Z1), Z2 = A1·W2 + b2, A2 = softmax(Z2)",
      "Loss: cross-entropy = -mean(sum(Y_onehot * log(A2)))",
      "Backward: dZ2 = A2 - Y_onehot, dW2 = A1.T @ dZ2, then chain rule back through ReLU",
    ],
    modelAnswer: `import numpy as np

def relu(x):       return np.maximum(0, x)
def relu_back(x):  return (x > 0).astype(float)

def softmax(x):
    e = np.exp(x - x.max(axis=1, keepdims=True))
    return e / e.sum(axis=1, keepdims=True)

def cross_entropy(probs, y_onehot):
    return -np.mean(np.sum(y_onehot * np.log(probs + 1e-9), axis=1))

class TwoLayerNet:
    def __init__(self, n_in, n_hidden, n_out, lr=0.01):
        self.lr = lr
        # He initialisation for ReLU
        self.W1 = np.random.randn(n_in, n_hidden) * np.sqrt(2 / n_in)
        self.b1 = np.zeros((1, n_hidden))
        self.W2 = np.random.randn(n_hidden, n_out) * np.sqrt(2 / n_hidden)
        self.b2 = np.zeros((1, n_out))

    def forward(self, X):
        self.X  = X
        self.Z1 = X @ self.W1 + self.b1
        self.A1 = relu(self.Z1)
        self.Z2 = self.A1 @ self.W2 + self.b2
        self.A2 = softmax(self.Z2)
        return self.A2

    def backward(self, y_onehot):
        m = self.X.shape[0]
        dZ2 = self.A2 - y_onehot                       # softmax + CE gradient
        dW2 = self.A1.T @ dZ2 / m
        db2 = dZ2.mean(axis=0, keepdims=True)
        dA1 = dZ2 @ self.W2.T
        dZ1 = dA1 * relu_back(self.Z1)                 # chain through ReLU
        dW1 = self.X.T @ dZ1 / m
        db1 = dZ1.mean(axis=0, keepdims=True)
        # Gradient descent
        self.W2 -= self.lr * dW2;  self.b2 -= self.lr * db2
        self.W1 -= self.lr * dW1;  self.b1 -= self.lr * db1

    def train(self, X, y_onehot, epochs=500):
        for epoch in range(epochs):
            probs = self.forward(X)
            loss  = cross_entropy(probs, y_onehot)
            self.backward(y_onehot)
            if epoch % 100 == 0:
                acc = (probs.argmax(1) == y_onehot.argmax(1)).mean()
                print(f"Epoch {epoch:4d} | loss={loss:.4f} | acc={acc:.3f}")

# Quick smoke-test on XOR
if __name__ == "__main__":
    X = np.array([[0,0],[0,1],[1,0],[1,1]], dtype=float)
    y = np.array([[1,0],[0,1],[0,1],[1,0]])          # XOR labels one-hot
    net = TwoLayerNet(2, 8, 2, lr=0.1)
    net.train(X, y, epochs=2000)`,
    rubric: [
      "Forward pass: Z1, A1 (ReLU), Z2, A2 (softmax) computed correctly",
      "Cross-entropy loss includes log-clipping (+ 1e-9) to avoid log(0)",
      "dZ2 = A2 - y_onehot (correct softmax + CE combined gradient)",
      "ReLU backward applied correctly (relu_back / step function)",
      "Weight updates use average gradient (divide by m)",
      "He initialisation used for ReLU layers",
      "Training loop prints loss and accuracy",
    ],
    tags: ["from-scratch", "numpy", "backprop"],
    commonMistakes: ["Not dividing gradients by batch size m", "Missing ReLU backward (common: forgetting to chain through activation)", "Using random normal init without scaling (exploding gradients)"],
  },
];
