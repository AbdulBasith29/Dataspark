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

  {
    id: "dlq4", courseId: "deep-learning", topicId: "dl-foundations",
    title: "SGD vs Adam vs RMSProp — When to Use Each", difficulty: "Medium", type: "open-ended", estimatedMinutes: 15,
    prompt: "A colleague always defaults to Adam. Explain what Adam is doing mechanically, when SGD with momentum outperforms it, and when RMSProp is preferred. Give one concrete example for each.",
    hints: [
      "Adam = RMSProp + momentum: adapts per-parameter learning rates AND maintains a momentum term",
      "SGD+momentum generalization: lower test error on vision tasks because of the loss landscape it explores",
      "RMSProp: good for non-stationary objectives — RNNs, online learning",
    ],
    modelAnswer: `**Adam mechanics:**
Adam maintains two running averages per parameter: (1) the first moment m (like momentum, exponential average of gradients) and (2) the second moment v (like RMSProp, exponential average of squared gradients). The update is:
- m = β1·m + (1-β1)·g
- v = β2·v + (1-β2)·g²
- θ ← θ - lr · m̂ / (√v̂ + ε)

Bias-corrected m̂ and v̂ prevent the running averages from being too small early in training.

**When SGD+momentum beats Adam:**
Vision tasks (ResNet, VGG) trained on ImageNet. Multiple papers (Wilson et al. 2017) show Adam converges faster but generalises worse — it finds "sharp" minima that overfit, while SGD+momentum's noisier updates explore flatter minima that generalise better.

Concrete example: ResNet-50 on ImageNet — SGD+momentum typically achieves 76-77% top-1 accuracy vs Adam ~74-75%, given the same compute budget.

**When RMSProp is preferred:**
Non-stationary objectives where gradient magnitude varies greatly over time. Classic case: LSTM language models or policy gradient in RL (used in DQN). RMSProp adapts per-parameter learning rates without the momentum term, which can overshoot in RL where the objective function changes as the policy improves.

**Rule of thumb:**
- Default for new tasks: Adam with lr=1e-3 (fast convergence, good enough)
- Fine-tuning pre-trained models: AdamW (Adam + weight decay, prevents weight explosion)
- Vision classification from scratch: SGD + momentum (lr=0.1, cosine schedule) for best final accuracy
- RNNs / RL: RMSProp`,
    rubric: [
      "Explains Adam as combination of momentum + adaptive learning rates",
      "Correctly explains the two running averages (first and second moment)",
      "Cites concrete example where SGD outgeneralizes Adam (vision tasks)",
      "Explains RMSProp use case (non-stationary, RNNs/RL)",
      "Provides actionable rule of thumb for when to use each",
    ],
    tags: ["optimizers", "training", "Adam"],
    commonMistakes: ["Saying Adam always converges to worse solutions — it converges faster, generalization gap depends on task and hyperparameters", "Confusing weight decay with L2 regularization — AdamW decouples them, vanilla Adam conflates them", "Not knowing that RMSProp came from Hinton's unpublished Coursera lecture, not a paper"],
  },
  {
    id: "dlq5", courseId: "deep-learning", topicId: "dl-foundations",
    title: "Batch Normalization — Explain and Place", difficulty: "Medium", type: "open-ended", estimatedMinutes: 15,
    prompt: "Explain what batch normalization does mechanically. Why does it help training? Where should it be placed relative to activation functions? How does inference differ from training?",
    hints: [
      "BatchNorm normalises the pre-activation values across the batch: zero mean, unit variance",
      "Learnable scale (γ) and shift (β) allow the network to undo the normalization if needed",
      "At inference there is no batch — use running statistics collected during training",
    ],
    modelAnswer: `**Mechanics:**
For a mini-batch B = {x1..xm}, BatchNorm computes:
1. μ_B = mean(x_i over batch)
2. σ²_B = variance(x_i over batch)
3. x̂_i = (x_i - μ_B) / √(σ²_B + ε)   ← normalise
4. y_i = γ·x̂_i + β                    ← scale and shift (learnable)

γ and β are trained parameters — they let the network learn the optimal scale for each layer's activations.

**Why it helps:**
1. **Reduces internal covariate shift** — each layer's input distribution stays roughly constant as weights update, making gradient flow more stable
2. **Allows higher learning rates** — the normalised inputs reduce the risk of exploding activations or saturated sigmoids
3. **Acts as mild regulariser** — the batch noise in μ_B and σ²_B adds slight randomness (reduces reliance on any single sample)

**Placement:**
The standard placement in modern networks is **before the activation function** (after the linear/conv layer):
Linear → BatchNorm → ReLU

Some practitioners place it after the activation (original paper used it before), but "before" has become the empirical standard for ResNets.

**Training vs inference:**
During training: normalise using batch statistics (μ_B, σ²_B).
During inference: batch may be a single sample. Instead, use running statistics accumulated during training:
- running_mean = 0.9·running_mean + 0.1·μ_B (exponential moving average)
- Same for running_var

This is why model.eval() in PyTorch is critical — it switches BatchNorm from batch statistics to running statistics. Forgetting model.eval() causes inconsistent inference behaviour.`,
    rubric: [
      "Correctly describes the four-step normalization formula",
      "Explains learnable γ and β parameters",
      "Gives at least two reasons why BatchNorm helps training",
      "States the placement as before activation function",
      "Explains the training vs inference difference (batch vs running statistics)",
      "Mentions model.eval() or equivalent as practical consequence",
    ],
    tags: ["batch-normalization", "training-stability", "deep-learning"],
    commonMistakes: ["Saying BatchNorm eliminates the need for careful weight initialization — it reduces sensitivity but doesn't replace it", "Forgetting to switch to running statistics at inference time — this causes training/inference accuracy mismatch", "Placing BatchNorm after the activation (minor, but 'before' is the empirical standard)"],
  },
  {
    id: "dlq6", courseId: "deep-learning", topicId: "dl-foundations",
    title: "Diagnose and Fix Overfitting", difficulty: "Medium", type: "open-ended", estimatedMinutes: 15,
    prompt: "Your model reaches 98% training accuracy but 72% validation accuracy after 50 epochs, and the gap widens over time. Describe a systematic approach to diagnose the severity and fix it. Rank your interventions by expected impact.",
    hints: [
      "Training/val gap = overfitting. The question is: how much capacity does the model have vs how much data?",
      "More data > regularisation > architecture simplification (order of impact for most tasks)",
      "Early stopping based on val loss is the fastest zero-cost fix",
    ],
    modelAnswer: `**Diagnosis:**
Training acc 98%, val acc 72%, widening gap = classic overfitting. The model has learned the training set's noise and idiosyncrasies rather than the underlying pattern.

**Interventions ranked by expected impact:**

**1. Early stopping (immediate, zero cost)**
Stop training when validation loss stops improving for N epochs (patience=5–10). This alone often closes 5–10% of the gap. Implement with a checkpoint that saves the best val-loss weights.

**2. Data augmentation (high impact, if applicable)**
For images: random flips, crops, colour jitter. For text: synonym replacement, back-translation. Augmentation effectively multiplies your dataset size and forces the model to learn invariant features.

**3. Dropout**
Add Dropout(p=0.3–0.5) layers before the final fully-connected layers. During training, randomly zeros activations — the network can't co-adapt neurons, forcing more distributed representations. Remember: disable during inference.

**4. L2 regularisation (weight decay)**
Add weight_decay=1e-4 to the optimizer. Penalises large weights, encourages simpler models. Less impactful than augmentation or dropout for most deep networks, but easy to add.

**5. Reduce model capacity**
If all else fails, reduce the number of layers or hidden units. The 98/72 gap suggests the model has far more capacity than the training data warrants.

**6. Get more training data**
The most reliable fix — overfitting is fundamentally a data scarcity problem. Even 2× more data often closes the gap more than any regularisation strategy.

**What NOT to do:** increase training epochs — the gap will only widen.`,
    rubric: [
      "Correctly identifies the 98/72 pattern as overfitting",
      "Early stopping mentioned as immediate, zero-cost fix",
      "Dropout described with correct placement (before FC layers) and inference caveat",
      "Data augmentation or more data ranked highest for impact",
      "L2 regularisation / weight decay included",
      "Advice against continuing to train further",
    ],
    tags: ["overfitting", "regularization", "generalization"],
    commonMistakes: ["Recommending more training epochs — this makes overfitting worse", "Applying dropout before convolutional layers instead of FC layers (minor but common mistake)", "Not mentioning early stopping — the single easiest win"],
  },
  {
    id: "dlq7", courseId: "deep-learning", topicId: "dl-architectures",
    title: "Self-Attention: Compute It by Hand", difficulty: "Hard", type: "open-ended", estimatedMinutes: 20,
    prompt: "Explain self-attention mechanically. Given queries Q, keys K, and values V matrices, write out the exact computation. Why is there a √dk scaling factor? What does multi-head attention add?",
    hints: [
      "Attention(Q,K,V) = softmax(QKᵀ / √dk) · V",
      "Without √dk scaling, dot products in high dimensions grow large → softmax saturates → vanishing gradients",
      "Multi-head: run attention h times with different projections, then concatenate outputs",
    ],
    modelAnswer: `**Self-attention computation:**

Given input matrix X (sequence_length × d_model):
1. Project into Q, K, V using learned weight matrices:
   Q = X·W_Q, K = X·W_K, V = X·W_V  (each shape: seq_len × d_k)

2. Compute attention scores:
   scores = Q·Kᵀ / √d_k   (shape: seq_len × seq_len)
   Each scores[i,j] = how much position i should attend to position j

3. Normalise with softmax (row-wise):
   weights = softmax(scores)   (each row sums to 1)

4. Weighted sum of values:
   output = weights · V   (shape: seq_len × d_k)

**Why √dk scaling:**
The dot product Q·Kᵀ has magnitude ~d_k (each dimension contributes ~1 on average). Without scaling, for d_k=64, scores are ~8× larger than they "should be." Large inputs to softmax push probabilities toward 0 or 1 — the gradient of softmax vanishes in this regime, making attention weights non-differentiable and learning slow. Dividing by √d_k keeps scores in a reasonable range where gradients flow.

**Multi-head attention:**
Run h parallel attention heads, each with its own Q, K, V projections (d_k = d_model / h):

MultiHead(Q,K,V) = Concat(head_1, ..., head_h) · W_O

Each head learns to attend to different relationships — one head might attend to syntactic structure, another to semantic similarity, another to positional proximity. The concatenation is projected back to d_model via W_O.

**Why it matters:** A single attention head has one "view" of relevance. Multi-head gives the model h independent views, each learning a different notion of what's related.`,
    rubric: [
      "States full formula: softmax(QKᵀ/√dk)·V",
      "Explains √dk scaling prevents softmax saturation and vanishing gradients",
      "Correctly describes Q, K, V projections from input X",
      "Explains multi-head as h parallel heads with different projections",
      "Describes concatenation + final projection W_O",
      "Gives intuition for why multi-head is useful (different relationship types)",
    ],
    tags: ["attention", "transformers", "self-attention"],
    commonMistakes: ["Saying attention is just a lookup table — it is a weighted average of values, not a discrete lookup", "Forgetting the W_O projection after concatenating heads", "Saying √dk prevents vanishing gradients in the MLP, not the softmax — the mechanism is specific to dot product magnitude before softmax"],
  },
  {
    id: "dlq8", courseId: "deep-learning", topicId: "dl-architectures",
    title: "Transfer Learning: Feature Extraction vs Fine-Tuning", difficulty: "Medium", type: "open-ended", estimatedMinutes: 15,
    company: "Google",
    prompt: "You have a ResNet-50 pre-trained on ImageNet. Your task is classifying medical X-rays (5,000 labelled images, 3 classes). Describe two transfer learning strategies, when to use each, and what practical steps you would take.",
    hints: [
      "Feature extraction: freeze all layers, only train the new classification head",
      "Fine-tuning: unfreeze some or all layers and train end-to-end with a small learning rate",
      "The closer your domain is to ImageNet, the more layers you can keep frozen",
    ],
    modelAnswer: `**Strategy 1 — Feature Extraction (freeze backbone):**

Freeze all ResNet-50 weights. Remove the final FC layer, add a new head (e.g. Linear(2048, 3)). Train only the head.

When to use: your dataset is small AND your domain is somewhat similar to ImageNet (X-rays are different from natural photos, but edges, textures, and spatial hierarchies are still learned features).

Steps:
1. Load pretrained ResNet-50; set requires_grad=False for all backbone parameters
2. Replace model.fc with Linear(2048, 3) + softmax
3. Train with lr=1e-3 for 20–30 epochs
4. Validation accuracy at this stage: ~80–85% (quick, low overfitting risk)

**Strategy 2 — Progressive Fine-Tuning:**

Start with feature extraction (above), then gradually unfreeze deeper layers.

Steps:
1. Train head only for 10 epochs (as above)
2. Unfreeze layer4 (the last ResNet block); reduce lr to 1e-4 — very small to avoid destroying pretrained weights
3. Train for 10 more epochs
4. Optionally unfreeze layer3; lr=1e-5
5. Full fine-tuning rarely needed for 5k images — risk of overfitting increases

**Decision for this task:**
With only 5,000 images and a domain shift (medical vs natural images), I'd start with feature extraction to establish a baseline, then apply progressive fine-tuning on the last 1–2 blocks. Full fine-tuning with 5k images risks destroying the pretrained representations faster than new patterns can be learned.

**Practical note:** Always use a lower learning rate for fine-tuned layers than for the fresh head. A common pattern: head lr=1e-3, unfrozen backbone lr=1e-5 (100× smaller).`,
    rubric: [
      "Correctly describes feature extraction (freeze backbone, train head only)",
      "Correctly describes fine-tuning (unfreeze layers, small lr)",
      "Explains progressive/gradual unfreezing strategy",
      "Recommends feature extraction first for small dataset",
      "Mentions using lower lr for pre-trained layers vs new head",
      "Addresses domain shift (medical vs natural images) in decision",
    ],
    tags: ["transfer-learning", "fine-tuning", "ResNet"],
    commonMistakes: ["Fine-tuning all layers from the start with a large learning rate — destroys pretrained weights", "Using the same learning rate for the head and the backbone", "Not starting with feature extraction as a baseline before attempting full fine-tuning"],
  },
  {
    id: "dlq9", courseId: "deep-learning", topicId: "dl-foundations",
    title: "Dropout: Mechanism and Inference Behaviour", difficulty: "Easy", type: "open-ended", estimatedMinutes: 12,
    company: "Meta",
    prompt: "Explain what dropout does during training and why it works as a regulariser. What changes at inference time and why? Write a minimal PyTorch implementation of a dropout layer from scratch.",
    hints: [
      "Training: randomly zero activations with probability p; scale remaining activations by 1/(1-p) (inverted dropout)",
      "Inference: no zeroing — but you need consistent expected activation magnitude",
      "The ensemble interpretation: dropout trains ~2^n subnetworks; inference averages them",
    ],
    modelAnswer: `**Training behaviour:**
Dropout randomly sets each activation to 0 with probability p (commonly 0.2–0.5). The surviving activations are scaled by 1/(1-p) — this is "inverted dropout," which keeps the expected sum of activations consistent regardless of p.

**Why it works:**
1. **Ensemble effect:** each training step uses a different subnetwork (random mask). At inference, using all weights is approximately averaging ~2^n trained subnetworks — an ensemble without the cost of training separately.
2. **Co-adaptation prevention:** neurons cannot rely on any specific other neuron being present, forcing them to learn more independent, generalisable features.

**Inference:**
No activations are zeroed. Because inverted dropout already rescaled during training, the inference pass uses the full network without any adjustment. Without inverted dropout (old-style), you'd multiply weights by (1-p) at inference — this is why modern frameworks all use inverted dropout.

**PyTorch implementation from scratch:**
\`\`\`python
import torch
import torch.nn as nn

class Dropout(nn.Module):
    def __init__(self, p=0.5):
        super().__init__()
        assert 0 <= p < 1, "p must be in [0, 1)"
        self.p = p

    def forward(self, x):
        if not self.training:
            return x                              # no dropout at inference
        # Bernoulli mask: 1 with prob (1-p), 0 with prob p
        mask = torch.bernoulli(torch.full_like(x, 1 - self.p))
        return x * mask / (1 - self.p)           # inverted dropout scaling
\`\`\`

Key: self.training flag (set by model.train() / model.eval()) controls whether dropout is active.`,
    rubric: [
      "Explains training behaviour: random zeroing with probability p",
      "Describes inverted dropout scaling by 1/(1-p)",
      "Explains inference: no zeroing needed due to inverted scaling",
      "Gives ensemble interpretation of why dropout works",
      "Implementation uses self.training to disable at inference",
      "Uses torch.bernoulli for the random mask",
    ],
    tags: ["dropout", "regularization", "pytorch"],
    commonMistakes: ["Applying dropout during inference — this makes predictions non-deterministic and wrong", "Not scaling by 1/(1-p) during training (activations will be systematically smaller at inference)", "Using the same dropout rate everywhere — commonly 0.2 for convolutional layers, 0.5 for FC layers"],
  },
  {
    id: "dlq10", courseId: "deep-learning", topicId: "dl-architectures",
    title: "Skip Connections: Why ResNets Solve Depth", difficulty: "Medium", type: "open-ended", estimatedMinutes: 15,
    company: "Microsoft",
    prompt: "Plain deep networks (>20 layers) degrade in accuracy, not just due to overfitting. Explain the problem skip connections solve, the mathematical form of a residual block, and why this makes very deep networks trainable.",
    hints: [
      "The degradation problem: training accuracy itself degrades — this is not overfitting, it is an optimisation problem",
      "A residual block learns F(x) = H(x) - x, where H(x) is the desired mapping",
      "Gradient highway: gradients can flow directly back through the shortcut connection without going through activation functions",
    ],
    modelAnswer: `**The problem — degradation (not overfitting):**
When you stack 50+ plain layers, training accuracy gets worse, not just test accuracy. This means the network cannot even optimise the training set — it is a fundamentally harder optimisation problem, not overfitting. The hypothesis: it is harder to learn an identity mapping H(x) = x through a deep stack of nonlinear layers than to learn a zero residual F(x) = 0.

**Residual block:**
Instead of learning H(x) directly, learn the residual:
F(x) = H(x) - x    →    H(x) = F(x) + x

The block computes:
\`\`\`
y = F(x, {Wi}) + x
\`\`\`
where F is typically: Conv → BN → ReLU → Conv → BN

The shortcut (+x) bypasses these layers. If the optimal transformation is close to identity, the network just needs to push F(x) → 0, which is much easier than learning H(x) = identity through nonlinear layers.

**Why it enables depth:**
1. **Gradient highway:** during backpropagation, gradients can flow through the shortcut path (∂loss/∂x = ∂loss/∂y · (∂F/∂x + 1)). The +1 term ensures gradients are never zero even when ∂F/∂x vanishes — this prevents the vanishing gradient problem in very deep networks.

2. **Identity shortcut is free:** if a layer is unnecessary, the network can learn F(x) ≈ 0 and the block becomes a near-identity, effectively reducing the depth adaptively.

ResNet-152 (152 layers) was trained successfully; plain 56-layer networks degraded vs 20-layer ones. The fix was purely architectural — same parameters, different connectivity.`,
    rubric: [
      "Explains degradation as an optimisation problem, not overfitting",
      "States the residual formula: y = F(x) + x",
      "Explains that F(x) = H(x) - x makes identity easier to learn",
      "Describes gradient highway through the shortcut (+1 term in gradient)",
      "Connects vanishing gradient prevention to the +1 gradient term",
      "Mentions ResNet-152 or similar as concrete evidence",
    ],
    tags: ["ResNet", "skip-connections", "vanishing-gradients"],
    commonMistakes: ["Saying degradation is just overfitting — it appears in training accuracy, not just test accuracy", "Confusing skip connections (ResNet) with dense connections (DenseNet)", "Not explaining the gradient highway — just saying 'skip connections help gradients flow' without the mathematical reason"],
  },

];
