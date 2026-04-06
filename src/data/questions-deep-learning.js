// AGENT: curriculum-agent
// COURSE: Deep Learning
// STATUS: Complete — 40 questions
// REVIEWED: Pending review-agent

export const DEEP_LEARNING_QUESTIONS = [

  // ═══ DL FUNDAMENTALS (8 questions) ═══

  {
    id: "dl-q01", courseId: "deep-learning", topicId: "dl-fundamentals",
    title: "Diagnosing Vanishing Gradients",
    difficulty: "Medium", company: "Google", type: "open-ended", estimatedMinutes: 12,
    prompt: `You're training a 20-layer neural network at Google to classify medical images. After 50 epochs, the loss on the training set barely moves. Gradient inspection shows values near 1e-8 in early layers. What's happening, and how do you fix it?`,
    hints: ["Sigmoid/tanh saturate and squash gradients to near-zero", "Batch normalization re-centers activations", "Skip connections allow gradients to bypass deep layers"],
    modelAnswer: `**Problem: Vanishing Gradients**\n\nWith 20 layers, gradients are multiplied through the chain rule at each layer. If activation functions like sigmoid compress values to (0,1), repeated multiplication drives gradients toward zero — early layers receive almost no signal.\n\n**Fixes in order of priority:**\n\n1. **Switch to ReLU activations** — ReLU gradient is either 0 or 1, not squashed. Variants (Leaky ReLU, GELU) prevent dead neurons.\n2. **Add Batch Normalization** after linear layers — normalizes activations to zero mean/unit variance, keeping gradient magnitudes healthy.\n3. **Use skip connections (ResNet-style)** — identity shortcuts let gradients flow directly to early layers.\n4. **He initialization** for ReLU networks prevents initial vanishing.\n5. **Gradient clipping** caps gradient norms to stabilize training dynamics.`,
    rubric: ["Correctly identifies vanishing gradient cause", "Recommends ReLU over sigmoid", "Mentions batch normalization", "Mentions skip connections or ResNet", "Correct weight initialization advice"],
    tags: ["vanishing-gradients", "batch-norm", "ResNet", "activation-functions"],
    commonMistakes: ["Only suggesting learning rate changes", "Not mentioning skip connections", "Confusing vanishing with exploding gradients"]
  },
  {
    id: "dl-q02", courseId: "deep-learning", topicId: "dl-fundamentals",
    title: "Activation Functions Compared",
    difficulty: "Easy", company: "Meta", type: "open-ended", estimatedMinutes: 12,
    prompt: `You're joining Meta's fundamental research team. Explain the key differences between sigmoid, tanh, ReLU, and GELU activation functions. For each: describe the output range, gradient behavior, and the primary use case in modern deep learning.`,
    hints: ["Sigmoid outputs (0,1), tanh outputs (-1,1)", "ReLU has zero gradient for x<0 (dead neuron problem)", "GELU is used in Transformers (BERT, GPT)"],
    modelAnswer: `## Activation Functions Compared\n\n| Function | Output Range | Gradient issue | Dead neurons? | Primary use |\n|----------|-------------|----------------|---------------|-------------|\n| Sigmoid | (0, 1) | Saturates — near-zero gradient | No | Binary output, LSTM gates |\n| Tanh | (-1, 1) | Saturates — near-zero gradient | No | Hidden layers pre-2010, LSTM gates |\n| ReLU | [0, \u221e) | 0 for x\u22640, 1 for x>0 | Yes (x<0 always 0) | Default hidden layers in CNNs/MLPs |\n| GELU | ~(-0.17, \u221e) | Smooth, non-zero everywhere | No | Transformer hidden layers |\n\n**Sigmoid:** Creates vanishing gradients in deep networks. Still used in binary classifier output layers and as gates in LSTM/GRU cells.\n\n**Tanh:** Zero-centered (unlike sigmoid), slight improvement in gradient flow. Mostly replaced by ReLU.\n\n**ReLU:** f(x) = max(0, x). Computationally cheap, solves vanishing gradients for positive activations. Risk: "dead ReLU" — neurons stuck at 0. Leaky ReLU (f(x) = max(0.01x, x)) mitigates this.\n\n**GELU:** f(x) = x * \u03a6(x) where \u03a6 is the standard normal CDF. Smooth probabilistic gating. Used in all modern Transformers because it outperforms ReLU on language tasks.`,
    rubric: ["Correct output range for all four", "Identifies vanishing gradient issue for sigmoid and tanh", "Explains dead neuron problem in ReLU", "Correctly identifies GELU as Transformer standard", "Mentions Leaky ReLU variant"],
    tags: ["activation-functions", "sigmoid", "relu", "gelu", "tanh"],
    commonMistakes: ["Confusing output ranges", "Not explaining why ReLU replaced sigmoid for hidden layers", "Missing GELU's Transformer use case"]
  },
  {
    id: "dl-q03", courseId: "deep-learning", topicId: "dl-fundamentals",
    title: "Backpropagation from Scratch",
    difficulty: "Hard", company: "DeepMind", type: "code", language: "python", estimatedMinutes: 25,
    prompt: `You're interviewing at DeepMind. Implement forward and backward pass for a 2-layer MLP using only NumPy. Architecture: Input(784) -> Linear(256) -> ReLU -> Linear(10) -> Softmax -> Cross-entropy loss. Implement forward(), backward(), and a single SGD update.`,
    hints: ["Softmax + cross-entropy gradient simplifies to (y_hat - y) / batch_size", "ReLU backward: pass gradient only where input > 0", "Chain rule: dL/dW1 = X.T @ delta1"],
    modelAnswer: `import numpy as np

class TwoLayerMLP:
    def __init__(self, input_dim=784, hidden_dim=256, output_dim=10, lr=0.01):
        # He initialization for ReLU layers
        self.W1 = np.random.randn(input_dim, hidden_dim) * np.sqrt(2.0 / input_dim)
        self.b1 = np.zeros((1, hidden_dim))
        self.W2 = np.random.randn(hidden_dim, output_dim) * np.sqrt(2.0 / hidden_dim)
        self.b2 = np.zeros((1, output_dim))
        self.lr = lr

    def relu(self, x):
        return np.maximum(0, x)

    def softmax(self, x):
        x_shifted = x - np.max(x, axis=1, keepdims=True)
        exp_x = np.exp(x_shifted)
        return exp_x / np.sum(exp_x, axis=1, keepdims=True)

    def cross_entropy_loss(self, y_hat, y):
        batch_size = y.shape[0]
        log_likelihood = -np.log(y_hat[range(batch_size), np.argmax(y, axis=1)] + 1e-8)
        return np.mean(log_likelihood)

    def forward(self, X):
        self.X = X
        self.z1 = X @ self.W1 + self.b1
        self.a1 = self.relu(self.z1)
        self.z2 = self.a1 @ self.W2 + self.b2
        self.y_hat = self.softmax(self.z2)
        return self.y_hat

    def backward(self, y):
        batch_size = y.shape[0]
        delta2 = (self.y_hat - y) / batch_size
        dW2 = self.a1.T @ delta2
        db2 = np.sum(delta2, axis=0, keepdims=True)
        delta1 = delta2 @ self.W2.T
        delta1 *= (self.z1 > 0)   # ReLU derivative
        dW1 = self.X.T @ delta1
        db1 = np.sum(delta1, axis=0, keepdims=True)
        self.W2 -= self.lr * dW2
        self.b2 -= self.lr * db2
        self.W1 -= self.lr * dW1
        self.b1 -= self.lr * db1

    def train_step(self, X, y):
        y_hat = self.forward(X)
        loss = self.cross_entropy_loss(y_hat, y)
        self.backward(y)
        return loss`,
    rubric: ["He initialization for ReLU", "Numerically stable softmax (subtract max)", "Correct softmax+cross-entropy gradient (y_hat-y)/N", "ReLU backward using (z1>0) mask", "Correct matrix dimensions throughout"],
    tags: ["backpropagation", "chain-rule", "numpy", "mlp", "from-scratch"],
    commonMistakes: ["Numerically unstable softmax", "Wrong ReLU backward", "Incorrect matrix transpose in gradient", "Not dividing by batch size"]
  },
  {
    id: "dl-q04", courseId: "deep-learning", topicId: "dl-fundamentals",
    title: "Batch Normalization: Training vs Inference",
    difficulty: "Medium", company: "Google", type: "open-ended", estimatedMinutes: 15,
    prompt: `You're debugging a model at Google that gets 97% training accuracy but drops to 78% at inference time with batch_size=1. A colleague says 'just remove batch norm.' Explain why this happens, the correct fix, and how BatchNorm behaves differently in training vs inference.`,
    hints: ["During training, BatchNorm uses per-batch statistics (mean, variance)", "During inference, it uses running averages accumulated during training", "model.eval() in PyTorch switches BatchNorm to use running statistics"],
    modelAnswer: `## Batch Normalization: Training vs Inference\n\n**Root cause:** During training, BatchNorm normalizes using the current mini-batch's mean and variance. At inference with batch_size=1, a single sample IS the batch — variance is 0, causing meaningless normalization.\n\n**How BatchNorm works:**\n\n**Training mode:**\n- Computes \u03bc_batch and \u03c3\u00b2_batch from the current mini-batch\n- Normalizes: x\u0302 = (x - \u03bc_batch) / \u221a(\u03c3\u00b2_batch + \u03b5)\n- Accumulates running_mean and running_var as exponential moving averages\n- Applies learnable scale (\u03b3) and shift (\u03b2)\n\n**Inference mode:**\n- Uses accumulated running_mean and running_var (NOT batch statistics)\n- Fully deterministic regardless of batch size\n\n**The fix — NOT removing BatchNorm:**\n\n\`\`\`python\n# WRONG: training mode during inference\nmodel.train()  # Bug!\noutput = model(x)\n\n# CORRECT: switch to eval mode\nmodel.eval()  # Switches BatchNorm and Dropout to inference mode\nwith torch.no_grad():\n    output = model(x)\n\`\`\`\n\nRemoving BatchNorm would harm training stability and likely reduce accuracy further. The fix is always model.eval() before inference.`,
    rubric: ["Identifies batch vs running statistics as root cause", "Explains training mode uses batch mean/var", "Explains inference mode uses running mean/var", "Shows model.eval() as the fix", "Correct code example"],
    tags: ["batch-normalization", "training-vs-inference", "model-eval", "pytorch"],
    commonMistakes: ["Suggesting to remove BatchNorm", "Not explaining running statistics accumulation", "Forgetting torch.no_grad() alongside model.eval()"]
  },
  {
    id: "dl-q05", courseId: "deep-learning", topicId: "dl-fundamentals",
    title: "Dropout: Mechanism and Inverted Scaling",
    difficulty: "Easy", company: "OpenAI", type: "open-ended", estimatedMinutes: 10,
    prompt: `You're onboarding at OpenAI. A new hire asks: 'Why does randomly zeroing neurons during training make the model better at test time?' Explain the mechanism, training vs inference behavior, and the inverted dropout scaling trick.`,
    hints: ["Dropout prevents co-adaptation", "At inference, all neurons are active — inverted dropout scales activations during training so inference needs no adjustment", "Dropout approximates training an ensemble of sub-networks"],
    modelAnswer: `## Why Dropout Works\n\n**Mechanism — preventing co-adaptation:**\nDropout randomly zeros neurons with probability p during training. This forces each neuron to learn independently useful features, preventing neurons from co-adapting (relying on specific other neurons to fix their mistakes). Conceptually, it trains an ensemble of 2^N different sub-networks simultaneously.\n\n**Inverted dropout (standard in PyTorch):**\n\n\`\`\`python\n# Training: zero with prob p, scale survivors by 1/(1-p)\nmask = (torch.rand(x.shape) > p).float()\nx_dropped = x * mask / (1 - p)  # Scale UP during training\n\n# Inference: use x directly — no scaling needed\n# model.eval() disables the mask and scaling automatically\n\`\`\`\n\nWithout inverted dropout, you'd need to multiply all activations by (1-p) at inference time. Inverted dropout makes inference zero-cost by doing the scaling during training.\n\n**Theoretical view:** Dropout approximates Bayesian inference over the network weights, providing uncertainty estimates if you keep dropout on at inference time (MC Dropout).`,
    rubric: ["Explains co-adaptation prevention", "Correct inverted dropout formula 1/(1-p) during training", "Training vs inference difference explained", "Ensemble interpretation mentioned", "Code example correct"],
    tags: ["dropout", "regularization", "inverted-dropout", "training-vs-inference"],
    commonMistakes: ["Saying dropout scales by (1-p) instead of 1/(1-p)", "Not explaining WHY it works (just saying regularization)", "Forgetting inverted dropout simplifies inference"]
  },
  {
    id: "dl-q06", courseId: "deep-learning", topicId: "dl-fundamentals",
    title: "He vs Xavier Weight Initialization",
    difficulty: "Easy", company: "DeepMind", type: "open-ended", estimatedMinutes: 10,
    prompt: `You're setting up a deep learning experiment at DeepMind. Explain Xavier (Glorot) and He initialization: the variance formula for each, when to use each, and what problem initialization solves.`,
    hints: ["Xavier variance: 2/(fan_in + fan_out)", "He variance: 2/fan_in — compensates for ReLU zeroing half the neurons", "Bad initialization = vanishing or exploding activations from layer 1"],
    modelAnswer: `## Weight Initialization: Xavier vs He\n\n**Problem solved:** Poor initialization causes activations to explode or vanish after a few layers before any learning occurs. Good initialization keeps variance stable across layers.\n\n**Xavier (Glorot):**\n- Var(W) = 2 / (fan_in + fan_out)\n- Designed for linear activations, tanh, sigmoid\n- Balances gradient variance in both forward and backward passes\n\n**He (Kaiming):**\n- Var(W) = 2 / fan_in\n- Designed for ReLU and variants (Leaky ReLU, ELU)\n- ReLU zeroes out ~50% of neurons, halving variance. He compensates by doubling Xavier's scale.\n\n**PyTorch:**\n\`\`\`python\nimport torch.nn as nn\n\n# He initialization for ReLU networks\nnn.init.kaiming_normal_(layer.weight, mode='fan_in', nonlinearity='relu')\n\n# Xavier for tanh/sigmoid\nnn.init.xavier_uniform_(layer.weight)\n\`\`\`\n\n**Rule of thumb:** He for ReLU (most CNNs, MLPs). Xavier for tanh/sigmoid/linear. For GELU Transformers, use Xavier or a small std (e.g., 0.02).`,
    rubric: ["Correct Xavier formula 2/(fan_in+fan_out)", "Correct He formula 2/fan_in", "Explains why ReLU needs larger scale than Xavier", "Links each to correct activation", "Code examples correct"],
    tags: ["weight-initialization", "xavier", "he-initialization", "kaiming"],
    commonMistakes: ["Getting formulas backwards", "Saying Xavier works for ReLU (causes vanishing)", "Not explaining the ReLU zeroing motivation for He"]
  },
  {
    id: "dl-q07", courseId: "deep-learning", topicId: "dl-fundamentals",
    title: "Learning Rate Schedulers in PyTorch",
    difficulty: "Medium", company: "Amazon", type: "code", language: "python", estimatedMinutes: 18,
    prompt: `You're training a ResNet-50 at Amazon for product image classification. Implement three learning rate schedulers: (1) Step decay — halve LR every 10 epochs, (2) Cosine annealing, (3) Linear warmup for 5 epochs then cosine decay. Show integration with a training loop.`,
    hints: ["torch.optim.lr_scheduler.StepLR for step decay", "CosineAnnealingLR for cosine", "LinearLR + SequentialLR for warmup+cosine"],
    modelAnswer: `import torch
import torch.nn as nn
import torch.optim as optim
from torch.optim.lr_scheduler import StepLR, CosineAnnealingLR, LinearLR, SequentialLR

model = nn.Linear(512, 10)
optimizer = optim.SGD(model.parameters(), lr=0.1, momentum=0.9, weight_decay=1e-4)
num_epochs = 100

# 1. Step Decay: halve LR every 10 epochs
scheduler_step = StepLR(optimizer, step_size=10, gamma=0.5)

# 2. Cosine Annealing
scheduler_cosine = CosineAnnealingLR(optimizer, T_max=num_epochs, eta_min=1e-6)

# 3. Warmup (5 epochs linear) + Cosine decay (95 epochs)
warmup_epochs = 5
warmup_scheduler = LinearLR(
    optimizer, start_factor=0.01, end_factor=1.0, total_iters=warmup_epochs
)
cosine_scheduler = CosineAnnealingLR(
    optimizer, T_max=num_epochs - warmup_epochs, eta_min=1e-6
)
scheduler_warmup_cosine = SequentialLR(
    optimizer,
    schedulers=[warmup_scheduler, cosine_scheduler],
    milestones=[warmup_epochs]
)

# Training loop
criterion = nn.CrossEntropyLoss()
scheduler = scheduler_warmup_cosine

for epoch in range(num_epochs):
    model.train()
    # for X, y in train_loader:
    #     optimizer.zero_grad()
    #     loss = criterion(model(X), y)
    #     loss.backward()
    #     optimizer.step()
    current_lr = optimizer.param_groups[0]['lr']
    scheduler.step()  # Always AFTER optimizer.step(), once per epoch
    print(f"Epoch {epoch+1:3d}: LR={current_lr:.6f}")`,
    rubric: ["StepLR with correct step_size and gamma=0.5", "CosineAnnealingLR with T_max", "LinearLR for warmup + SequentialLR", "scheduler.step() after each epoch (not batch)", "All three demonstrated"],
    tags: ["lr-scheduler", "warmup", "cosine-annealing", "pytorch"],
    commonMistakes: ["Calling scheduler.step() per batch instead of per epoch", "Forgetting eta_min (LR drops to 0)", "Using lambda scheduler when built-ins exist"]
  },
  {
    id: "dl-q08", courseId: "deep-learning", topicId: "dl-fundamentals",
    title: "PyTorch Autograd and Gradient Debugging",
    difficulty: "Medium", company: "Meta", type: "code", language: "python", estimatedMinutes: 15,
    prompt: `You're mentoring an intern at Meta whose custom loss function causes RuntimeError: 'element 0 of tensors does not require grad.' Explain PyTorch's autograd computation graph, demonstrate common patterns that detach gradients, and show how to debug gradient flow.`,
    hints: ["requires_grad=True marks a tensor for gradient tracking", "Operations on detached tensors or .item() break the graph", "register_hook and named_parameters() help debug gradient flow"],
    modelAnswer: `import torch
import torch.nn as nn

# Autograd basics: tensors with requires_grad=True build a computation graph
x = torch.tensor([2.0], requires_grad=True)
y = x ** 2 + 3 * x + 1
y.backward()
print(f"dy/dx at x=2: {x.grad}")  # 7.0

# --- Patterns that BREAK the gradient graph ---

# 1. numpy() on a grad tensor fails — must detach first
x = torch.randn(3, requires_grad=True)
x_np = x.detach().numpy()  # Correct

# 2. In-place ops on leaf tensors break autograd
x = torch.randn(3, requires_grad=True)
# x += 1  # RuntimeError!
x = x + 1  # Creates a new tensor, graph intact

# 3. .item() produces a Python float — not differentiable
# Always call .backward() on the tensor, not loss.item()

# --- Debugging gradient flow ---
model = nn.Sequential(nn.Linear(10, 5), nn.ReLU(), nn.Linear(5, 1))

def check_grad_flow(model):
    for name, param in model.named_parameters():
        if param.grad is not None:
            print(f"{name}: norm={param.grad.norm():.4f}")
        else:
            print(f"{name}: NO GRADIENT")

x = torch.randn(4, 10)
loss = model(x).mean()
loss.backward()
check_grad_flow(model)

# Register hook to inspect intermediate gradient
def grad_hook(grad):
    print(f"Intermediate grad norm: {grad.norm():.4f}")
    return grad

hidden = model[0](torch.randn(4, 10))
hidden.register_hook(grad_hook)`,
    rubric: ["Explains requires_grad mechanism", "Demonstrates detach before numpy", "Shows in-place op issue", "Implements gradient debugging via named_parameters", "Uses register_hook"],
    tags: ["autograd", "computation-graph", "pytorch", "debugging", "gradients"],
    commonMistakes: ["Not calling .detach() before numpy conversion", "In-place ops on leaf tensors", ".item() in loss computation breaks graph"]
  },

  // ═══ DL TRAINING (8 questions) ═══

  {
    id: "dl-q09", courseId: "deep-learning", topicId: "dl-training",
    title: "SGD vs Adam vs AdamW: When to Use Each",
    difficulty: "Medium", company: "OpenAI", type: "open-ended", estimatedMinutes: 15,
    prompt: `You're leading training runs at OpenAI. Your team debates whether to use SGD with momentum, Adam, or AdamW for a new language model. Explain the mechanics of each optimizer, their key differences, when each performs best, and what AdamW fixes about Adam.`,
    hints: ["Adam adapts per-parameter learning rates using first and second moment estimates", "Adam has implicit L2 regularization but it interacts badly with adaptive rates", "AdamW decouples weight decay from the gradient update"],
    modelAnswer: `## SGD vs Adam vs AdamW\n\n**SGD with Momentum:**\n- Update: v = \u03b2v + g; \u03b8 = \u03b8 - \u03b1v\n- Single global learning rate, no per-parameter adaptation\n- Pros: Often generalizes better for vision tasks; final accuracy often beats Adam\n- Cons: Sensitive to learning rate; requires careful tuning and warmup\n- Best for: CNNs on image tasks (ResNet, EfficientNet), when compute budget allows long training\n\n**Adam:**\n- Maintains running estimates of first moment (m = \u03b21*m + (1-\u03b21)*g) and second moment (v = \u03b22*v + (1-\u03b22)*g\u00b2)\n- Adaptive LR per parameter: \u03b8 = \u03b8 - \u03b1 * m\u0302 / (\u221av\u0302 + \u03b5)\n- Pros: Fast convergence, works well out of the box, robust to LR choice\n- Cons: Can overfit; L2 regularization interacts poorly with adaptive rates\n- Best for: NLP/Transformer training, rapid prototyping, tasks where convergence speed matters\n\n**AdamW:**\n- Decouples weight decay from gradient update:\n  - \u03b8 = \u03b8 - \u03b1 * (m\u0302/(\u221av\u0302 + \u03b5) + \u03bb\u03b8)  ← weight decay applied directly to weights\n- In Adam with L2 reg: \u03b8 = \u03b8 - \u03b1 * (m\u0302/(\u221av\u0302 + \u03b5) + \u03bb*g/\u221av\u0302) ← scaled by adaptive rate (wrong!)\n- AdamW weight decay is uniform across parameters regardless of gradient scale\n- Best for: All modern Transformer training (GPT, BERT, ViT). Default choice for large models.\n\n**Decision guide:**\n- Language models, Transformers → AdamW\n- CNNs for vision → SGD with momentum (better final accuracy with tuning)\n- Rapid experiments, new architectures → Adam (easier to tune)`,
    rubric: ["Correctly explains Adam moment estimates", "Identifies Adam's L2 regularization problem", "Explains AdamW's decoupled weight decay", "Gives correct use case for each", "Shows the mathematical difference between L2 in Adam vs AdamW"],
    tags: ["optimizers", "adam", "adamw", "sgd", "weight-decay"],
    commonMistakes: ["Confusing AdamW with Adam + L2 regularization (they're different)", "Saying Adam always outperforms SGD (SGD wins on vision with tuning)", "Not explaining decoupled weight decay"]
  },
  {
    id: "dl-q10", courseId: "deep-learning", topicId: "dl-training",
    title: "Batch Size Effects on Generalization",
    difficulty: "Medium", company: "Google", type: "open-ended", estimatedMinutes: 12,
    prompt: `You're at Google Brain researching training dynamics. Your experiment shows that increasing batch size from 256 to 8192 makes training converge much faster (per epoch) but the final validation accuracy is 2% lower. Explain why large batch training hurts generalization, and describe two techniques to recover the accuracy loss.`,
    hints: ["Large batches produce less noisy gradient estimates — converge to sharp minima", "Small batch noise acts as implicit regularization, finding flat minima that generalize better", "Linear scaling rule: scale LR proportionally when scaling batch size"],
    modelAnswer: `## Batch Size and Generalization\n\n**Why large batches hurt generalization:**\n\nSmall batch training computes gradient estimates from a tiny, noisy subset of data. This noise acts as *implicit regularization* — the optimizer wanders away from sharp minima and tends to settle in *flat minima*. Flat minima generalize better because small input perturbations cause small output changes.\n\nLarge batches produce low-variance, accurate gradient estimates. The optimizer converges quickly to sharp minima — narrow valleys in loss space. These sharp minima tend to overfit because small distribution shifts push predictions out of the narrow valley.\n\nThis phenomenon is known as the "generalization gap" (Keskar et al., 2017).\n\n**Technique 1: Linear Scaling Rule + Warmup**\nWhen scaling batch size by k, scale the learning rate by k:\n\`\`\`python\nbase_lr = 0.1\nbatch_scale = 8192 / 256  # = 32\nscaled_lr = base_lr * batch_scale  # = 3.2\n\`\`\`\nUse linear warmup for the first 5 epochs to prevent instability with the large LR.\n\n**Technique 2: Gradient Noise Injection**\nAdd Gaussian noise to gradients to simulate small-batch stochasticity:\n\`\`\`python\nfor param in model.parameters():\n    if param.grad is not None:\n        noise = torch.randn_like(param.grad) * noise_std\n        param.grad += noise\n\`\`\`\n\n**Technique 3: LARS / LAMB optimizers**\nLayer-wise Adaptive Rate Scaling (LARS) normalizes the gradient update by layer-wise gradient norms, allowing stable training at batch sizes of 32K+ (used to train ImageNet in minutes).`,
    rubric: ["Correctly explains sharp vs flat minima", "Links noise in small batches to implicit regularization", "Provides linear scaling rule with correct formula", "Mentions warmup requirement with large LR", "Describes at least two recovery techniques"],
    tags: ["batch-size", "generalization", "sharp-minima", "linear-scaling-rule"],
    commonMistakes: ["Saying large batch is always worse (with proper tuning it can match)", "Not mentioning the flat vs sharp minima theory", "Forgetting warmup when scaling LR"]
  },
  {
    id: "dl-q11", courseId: "deep-learning", topicId: "dl-training",
    title: "Early Stopping Implementation",
    difficulty: "Easy", company: "Netflix", type: "code", language: "python", estimatedMinutes: 12,
    prompt: `You're training a recommendation model at Netflix. Implement an EarlyStopping class in PyTorch that: monitors validation loss, stops training when loss doesn't improve for 'patience' epochs, saves the best model checkpoint, and supports a 'min_delta' threshold for meaningful improvement.`,
    hints: ["Track best_loss and counter for patience", "torch.save(model.state_dict(), path) saves checkpoint", "Return a stop_training flag from the check() method"],
    modelAnswer: `import torch
import numpy as np

class EarlyStopping:
    def __init__(self, patience=10, min_delta=1e-4, checkpoint_path='best_model.pt', verbose=True):
        self.patience = patience
        self.min_delta = min_delta
        self.checkpoint_path = checkpoint_path
        self.verbose = verbose
        self.best_loss = np.inf
        self.counter = 0
        self.stop_training = False

    def __call__(self, val_loss, model):
        if val_loss < self.best_loss - self.min_delta:
            # Genuine improvement
            self.best_loss = val_loss
            self.counter = 0
            torch.save(model.state_dict(), self.checkpoint_path)
            if self.verbose:
                print(f"  Validation loss improved to {val_loss:.6f}. Checkpoint saved.")
        else:
            self.counter += 1
            if self.verbose:
                print(f"  No improvement for {self.counter}/{self.patience} epochs.")
            if self.counter >= self.patience:
                self.stop_training = True
                if self.verbose:
                    print(f"Early stopping triggered. Best loss: {self.best_loss:.6f}")
        return self.stop_training

    def load_best_model(self, model):
        model.load_state_dict(torch.load(self.checkpoint_path))
        return model

# Usage
early_stopping = EarlyStopping(patience=10, min_delta=1e-4)
for epoch in range(500):
    # train_loss = train_epoch(...)
    # val_loss = evaluate(...)
    val_loss = 0.5 - epoch * 0.001 + np.random.normal(0, 0.01)  # simulated
    if early_stopping(val_loss, model=None):  # pass actual model
        break

# Restore best weights
# model = early_stopping.load_best_model(model)`,
    rubric: ["Patience counter increments on no improvement", "min_delta threshold prevents noise triggering early stop", "Best model checkpoint saved with torch.save", "stop_training returned from __call__", "load_best_model restores checkpoint"],
    tags: ["early-stopping", "checkpointing", "training", "pytorch"],
    commonMistakes: ["Comparing val_loss < best_loss without min_delta (noise triggers early stop)", "Saving model parameters not state_dict", "Not restoring best weights at end of training"]
  },
  {
    id: "dl-q12", courseId: "deep-learning", topicId: "dl-training",
    title: "Gradient Clipping for Stable Training",
    difficulty: "Easy", company: "DeepMind", type: "code", language: "python", estimatedMinutes: 10,
    prompt: `You're training a large language model at DeepMind and observe loss spikes every few hundred steps. A colleague suggests gradient clipping. Implement gradient clipping by global norm in PyTorch, explain how it works, and demonstrate how to choose the clipping threshold.`,
    hints: ["torch.nn.utils.clip_grad_norm_(params, max_norm) clips gradient norms globally", "Global norm = sqrt(sum of squared gradient norms across all parameters)", "Monitor grad_norm before clipping to choose a threshold"],
    modelAnswer: `import torch
import torch.nn as nn
import matplotlib.pyplot as plt

model = nn.Transformer(d_model=512, nhead=8)
optimizer = torch.optim.AdamW(model.parameters(), lr=1e-4)
criterion = nn.CrossEntropyLoss()

# Training step with gradient clipping
def train_step_with_clipping(model, optimizer, x, y, max_grad_norm=1.0):
    optimizer.zero_grad()
    output = model(x, x)
    loss = criterion(output.view(-1, output.shape[-1]), y.view(-1))
    loss.backward()

    # Compute global norm BEFORE clipping (for logging)
    total_norm = 0.0
    for p in model.parameters():
        if p.grad is not None:
            total_norm += p.grad.data.norm(2).item() ** 2
    total_norm = total_norm ** 0.5

    # Clip gradients
    torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=max_grad_norm)

    optimizer.step()
    return loss.item(), total_norm

# How gradient clipping works:
# Global norm = sqrt(sum of ||g_i||^2 for all parameter tensors i)
# If global_norm > max_norm:
#     scale = max_norm / global_norm
#     g_i = g_i * scale  (all gradients uniformly scaled)
# This preserves gradient direction while bounding magnitude.

# Choosing max_grad_norm:
# 1. Run without clipping for 100 steps, record grad norms
# 2. Set threshold at ~95th percentile of observed norms
# Common values: 1.0 (NLP/Transformers), 5.0 (RNNs)
grad_norms = []
for step in range(100):
    norm_before_clip = 0.0
    for p in model.parameters():
        if p.grad is not None:
            norm_before_clip += p.grad.data.norm(2).item() ** 2
    grad_norms.append(norm_before_clip ** 0.5)

threshold = sorted(grad_norms)[int(0.95 * len(grad_norms))]
print(f"Recommended max_grad_norm: {threshold:.2f}")`,
    rubric: ["torch.nn.utils.clip_grad_norm_ used correctly", "Explains global norm calculation", "Log grad norm before clipping for monitoring", "Direction preserved (uniform scaling)", "Method for choosing threshold explained"],
    tags: ["gradient-clipping", "training-stability", "pytorch", "exploding-gradients"],
    commonMistakes: ["Using clip_grad_value_ instead of clip_grad_norm_ (clips per-element, destroys gradient direction)", "Not monitoring grad norms to detect when clipping is triggered", "Clipping too aggressively (small max_norm slows learning)"]
  },
  {
    id: "dl-q13", courseId: "deep-learning", topicId: "dl-training",
    title: "Mixed Precision Training with FP16",
    difficulty: "Hard", company: "Uber", type: "code", language: "python", estimatedMinutes: 20,
    prompt: `You're optimizing training throughput at Uber's autonomous vehicle team. Your model trains in 8 hours on FP32. A colleague suggests mixed precision training. Implement mixed precision training using PyTorch's torch.cuda.amp, explain the 3 key components (autocast, GradScaler, loss scaling), and describe the potential pitfalls.`,
    hints: ["torch.cuda.amp.autocast() runs forward pass in FP16", "GradScaler prevents underflow by scaling loss before backward", "Master weights stay in FP32; only compute in FP16"],
    modelAnswer: `import torch
import torch.nn as nn
import torch.optim as optim
from torch.cuda.amp import autocast, GradScaler

model = nn.Sequential(nn.Linear(1024, 512), nn.ReLU(), nn.Linear(512, 10)).cuda()
optimizer = optim.AdamW(model.parameters(), lr=1e-3)
criterion = nn.CrossEntropyLoss()

# GradScaler: scales loss to prevent FP16 gradient underflow
scaler = GradScaler()

def train_step_amp(model, optimizer, X, y, scaler):
    optimizer.zero_grad()

    # autocast: automatically selects FP16 for compute-intensive ops
    # (matmul, conv) while keeping FP32 for numerically sensitive ops
    with autocast():
        output = model(X)
        loss = criterion(output, y)

    # Scale loss to prevent FP16 underflow in backward pass
    scaler.scale(loss).backward()

    # Unscale gradients, then clip (must unscale before clip_grad_norm_)
    scaler.unscale_(optimizer)
    torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)

    # Update weights (skips if NaN/Inf detected in gradients)
    scaler.step(optimizer)

    # Adjust scale factor for next iteration
    scaler.update()

    return loss.item()

# How mixed precision works:
# 1. autocast: FP16 for forward pass (2x-4x speedup on modern GPUs)
#    - FP16 range: ~6e-5 to 65504 (much narrower than FP32)
#    - Master weights kept in FP32 for optimizer updates
#
# 2. Loss scaling: multiply loss by scale_factor (e.g., 2^16)
#    - Shifts small gradients into FP16 representable range
#    - Prevents underflow to zero
#
# 3. GradScaler dynamic adjustment:
#    - If gradients contain NaN/Inf: skip update, halve scale_factor
#    - If stable for 2000 steps: double scale_factor

# Pitfalls:
# 1. Operations in autocast that don't support FP16 cause errors
#    (some custom ops) — wrap with autocast(enabled=False) for those
# 2. Forgetting scaler.unscale_ before gradient clipping
# 3. Not calling scaler.update() causes scale to never change
# 4. Batch norm statistics should stay in FP32 (autocast handles this)`,
    rubric: ["autocast context manager used in forward pass", "GradScaler scales loss before backward", "scaler.unscale_ before gradient clipping", "scaler.step and scaler.update called", "Explains FP16 underflow problem and why scaling helps"],
    tags: ["mixed-precision", "fp16", "autocast", "gradscaler", "pytorch"],
    commonMistakes: ["Clipping gradients before unscale_ (clips wrong scale)", "Not calling scaler.update() (scale never adapts)", "Putting backward() outside the scaler.scale() call"]
  },
  {
    id: "dl-q14", courseId: "deep-learning", topicId: "dl-training",
    title: "Debugging a Model That Won't Converge",
    difficulty: "Hard", company: "Apple", type: "open-ended", estimatedMinutes: 20,
    prompt: `You join Apple's ML team and inherit a model. The training loss starts at 2.3 but stays flat for 50 epochs — it refuses to learn. Walk through a systematic debugging checklist of at least 7 steps, from most likely to least likely causes. For each, describe the diagnostic test and the fix.`,
    hints: ["Check data pipeline first — corrupted batches are common", "Verify loss function is appropriate for the task", "Gradient norms near zero = no signal; near Inf = exploding"],
    modelAnswer: `## Systematic Debugging Checklist for Non-Converging Model\n\n**1. Verify the data pipeline (most common)**\n- Test: Print 5 batches. Check shapes, dtypes, value ranges. Check labels.\n- Common bugs: Labels off-by-one, images normalized wrong range (0-255 instead of 0-1), labels not matching class indices.\n\n**2. Overfit a single batch**\n- Test: Train on exactly 1 batch for 100 steps. Loss should go to near-zero.\n- If it doesn't: The architecture or loss is wrong, not the data.\n\`\`\`python\nfor _ in range(100):\n    loss = train_step(fixed_batch)\nprint(f"Loss: {loss:.4f}")  # Should be ~0\n\`\`\`\n\n**3. Check loss function**\n- Test: Manually verify loss on known inputs. For CrossEntropyLoss with 10 classes: random prediction should give -log(0.1) ≈ 2.3.\n- If initial loss is far from expected: Loss function mismatch (sigmoid vs softmax, reduction mode, etc.)\n\n**4. Check gradient norms**\n- Test: Print grad norms after first backward() call.\n- Near zero (< 1e-7): Vanishing gradients or dead neurons. Fix: change activation, check BN mode.\n- Near Inf / NaN: Exploding gradients or NaN in data. Fix: gradient clipping, find NaN source.\n\n**5. Verify learning rate**\n- Test: Try LR = 1.0, 0.1, 0.01, 0.001 on the single-batch overfit test.\n- Too high: loss diverges. Too low: loss barely moves for many steps.\n\n**6. Check weight initialization**\n- Test: Print mean and std of layer outputs before training.\n- Expected: Mean ~0, std ~1 for normalized inputs with proper init.\n\n**7. Verify optimizer is receiving correct parameters**\n- Test: \`print([name for name, p in model.named_parameters() if p not in set(optimizer.param_groups[0]["params"])])\`\n- Bug: Creating the model, then moving it to CUDA AFTER creating the optimizer. The optimizer has references to old CPU tensors.\n\n**8. Check for disconnected computation graph**\n- Test: After backward(), check \`param.grad is None\` for all parameters.\n- Fix: Ensure loss computation doesn't detach from the graph (avoid .numpy(), .item() in loss path).`,
    rubric: ["Single-batch overfit test mentioned", "Gradient norm check included", "Data pipeline verification as first step", "Learning rate check included", "Optimizer parameter reference bug mentioned", "At least 7 steps with diagnostics and fixes"],
    tags: ["debugging", "convergence", "training", "diagnostics"],
    commonMistakes: ["Starting with complex fixes (architecture changes) before checking data", "Not doing the single-batch overfit test", "Missing the optimizer-on-wrong-device bug"]
  },
  {
    id: "dl-q15", courseId: "deep-learning", topicId: "dl-training",
    title: "Data Augmentation Strategies for Image Classification",
    difficulty: "Easy", company: "Tesla", type: "code", language: "python", estimatedMinutes: 15,
    prompt: `You're training a road hazard detection model at Tesla. Your training set has 10,000 labeled images, not enough to prevent overfitting. Implement a comprehensive data augmentation pipeline using torchvision.transforms and albumentations. Include augmentations appropriate for autonomous driving (consider lighting, weather, perspective changes) and explain your choices.`,
    hints: ["Augmentations should be realistic (avoid random vertical flips for road images)", "ColorJitter simulates lighting and weather conditions", "RandomPerspective and RandomAffine simulate camera angle changes"],
    modelAnswer: `import torch
import torchvision.transforms as T
from torchvision.transforms import v2 as Tv2
import albumentations as A
from albumentations.pytorch import ToTensorV2

# --- torchvision pipeline (simple, well-integrated) ---
train_transform_torchvision = T.Compose([
    T.Resize((224, 224)),
    T.RandomHorizontalFlip(p=0.5),       # Roads are horizontally symmetric
    # NO vertical flip — roads don't appear upside down
    T.RandomRotation(degrees=10),         # Slight camera tilt
    T.ColorJitter(
        brightness=0.4,                  # Cloud cover, time of day
        contrast=0.4,                    # Fog, rain
        saturation=0.3,                  # Weather variations
        hue=0.1                          # Slight color temp changes
    ),
    T.RandomPerspective(distortion_scale=0.2, p=0.3),  # Camera angle
    T.GaussianBlur(kernel_size=3, sigma=(0.1, 2.0)),   # Motion blur
    T.RandomGrayscale(p=0.05),           # Night/IR camera simulation
    T.ToTensor(),
    T.Normalize(mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225])  # ImageNet stats
])

# --- albumentations pipeline (more advanced, faster on CPU) ---
train_transform_alb = A.Compose([
    A.Resize(224, 224),
    A.HorizontalFlip(p=0.5),
    A.RandomBrightnessContrast(brightness_limit=0.3, contrast_limit=0.3, p=0.7),
    A.HueSaturationValue(hue_shift_limit=10, sat_shift_limit=20, p=0.4),
    A.RandomFog(fog_coef_lower=0.1, fog_coef_upper=0.3, p=0.2),  # Weather
    A.RandomRain(slant_lower=-10, slant_upper=10, p=0.2),
    A.MotionBlur(blur_limit=5, p=0.2),   # Camera motion
    A.GridDistortion(p=0.1),             # Lens distortion
    A.Normalize(mean=[0.485, 0.456, 0.406],
                std=[0.229, 0.224, 0.225]),
    ToTensorV2()
])

# Validation transform — only resize and normalize, no augmentation
val_transform = T.Compose([
    T.Resize((224, 224)),
    T.ToTensor(),
    T.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])`,
    rubric: ["No vertical flip (domain-appropriate choice)", "ColorJitter for lighting/weather", "Perspective or affine for camera angle", "Motion blur for driving scenario", "Val transform has no augmentation", "ImageNet normalization applied"],
    tags: ["data-augmentation", "torchvision", "albumentations", "autonomous-driving"],
    commonMistakes: ["Adding vertical flip (cars never drive upside down)", "Applying augmentation to validation set", "Forgetting normalization", "Using overly aggressive augmentations that change semantics"]
  },
  {
    id: "dl-q16", courseId: "deep-learning", topicId: "dl-training",
    title: "Learning Rate Finder",
    difficulty: "Medium", company: "Amazon", type: "code", language: "python", estimatedMinutes: 18,
    prompt: `You're starting a new training run at Amazon and want to find the optimal learning rate without hours of grid search. Implement Leslie Smith's learning rate finder: linearly increase the LR over 100 mini-batches, record the loss at each step, and identify the optimal LR as the point of steepest loss decrease.`,
    hints: ["Exponentially or linearly increase LR from min_lr to max_lr", "Record loss at each step; smooth with EMA", "Optimal LR is where d(loss)/d(log_lr) is most negative"],
    modelAnswer: `import torch
import torch.nn as nn
import numpy as np
import copy

def lr_finder(model, optimizer, train_loader, criterion,
              min_lr=1e-7, max_lr=10.0, num_iter=100, smooth_f=0.05):
    # Save model and optimizer state to restore after search
    model_state = copy.deepcopy(model.state_dict())
    optimizer_state = copy.deepcopy(optimizer.state_dict())

    lrs = []
    losses = []
    smoothed_losses = []
    avg_loss = 0.0
    best_loss = float('inf')

    # Exponential schedule: lr increases from min_lr to max_lr
    lr_multiplier = (max_lr / min_lr) ** (1 / (num_iter - 1))
    current_lr = min_lr

    data_iter = iter(train_loader)

    for i in range(num_iter):
        # Set learning rate
        for pg in optimizer.param_groups:
            pg['lr'] = current_lr

        try:
            X, y = next(data_iter)
        except StopIteration:
            data_iter = iter(train_loader)
            X, y = next(data_iter)

        X, y = X.cuda(), y.cuda()

        optimizer.zero_grad()
        output = model(X)
        loss = criterion(output, y)
        loss.backward()
        optimizer.step()

        loss_val = loss.item()

        # Smooth with exponential moving average
        avg_loss = smooth_f * loss_val + (1 - smooth_f) * avg_loss
        smoothed = avg_loss / (1 - (1 - smooth_f) ** (i + 1))  # bias correction

        lrs.append(current_lr)
        losses.append(loss_val)
        smoothed_losses.append(smoothed)

        # Stop if loss explodes
        if smoothed > 4 * best_loss:
            break
        if smoothed < best_loss:
            best_loss = smoothed

        current_lr *= lr_multiplier

    # Find LR at steepest decline
    smoothed_arr = np.array(smoothed_losses)
    gradients = np.gradient(smoothed_arr)
    optimal_idx = np.argmin(gradients)
    optimal_lr = lrs[optimal_idx]

    # Restore model and optimizer
    model.load_state_dict(model_state)
    optimizer.load_state_dict(optimizer_state)

    print(f"Optimal LR: {optimal_lr:.2e}")
    print(f"Suggested training LR: {optimal_lr / 10:.2e} to {optimal_lr:.2e}")
    return lrs, smoothed_losses, optimal_lr`,
    rubric: ["Exponential LR increase from min to max", "EMA smoothing of loss", "Model/optimizer state saved and restored", "Early stopping when loss explodes (4x best)", "Optimal LR found at minimum gradient of smoothed loss"],
    tags: ["lr-finder", "learning-rate", "training", "leslie-smith"],
    commonMistakes: ["Not restoring model state (LR finder corrupts weights)", "Using unsmoothed loss (noisy, hard to find minimum)", "Not stopping early when loss explodes"]
  },

  // ═══ DL CNN (8 questions) ═══

  {
    id: "dl-q17", courseId: "deep-learning", topicId: "dl-cnn",
    title: "Convolution Operation Explained",
    difficulty: "Easy", company: "Apple", type: "open-ended", estimatedMinutes: 12,
    prompt: `You're presenting to Apple's ML team. Explain the convolution operation in CNNs: what a kernel does, how stride and padding affect output dimensions, and compute the output size for: input (224x224x3), kernel (3x3), stride=2, padding=1, filters=64.`,
    hints: ["Output size = floor((input_size + 2*padding - kernel_size) / stride) + 1", "Padding preserves spatial dimensions", "Convolution detects local patterns via learned filters"],
    modelAnswer: `## CNN Convolution Operation\n\n**What a kernel does:**\nA convolutional kernel is a small weight matrix (e.g., 3x3) that slides across the input feature map. At each position, it computes a dot product between its weights and the corresponding input patch. Different kernels learn different features: edges, curves, textures.\n\nFor a 3x3 kernel on a 224x224 input:\n- Kernel slides across height and width\n- At each position: output = sum(kernel * input_patch) + bias\n- Multiple kernels produce multiple output channels (feature maps)\n\n**Stride:** How many pixels the kernel moves per step\n- stride=1: Dense sliding (high resolution output)\n- stride=2: Skip every other pixel (halves spatial dimensions — like pooling)\n\n**Padding:** Zeros added around the input border\n- padding=0 (valid): Output shrinks with each convolution\n- padding=1 (same for 3x3 kernel): Output size ≈ input size at stride=1\n\n**Output dimension formula:**\nH_out = floor((H_in + 2P - K) / S) + 1\n\n**Worked example:**\n- Input: 224 x 224 x 3\n- Kernel: 3x3, stride=2, padding=1, filters=64\n\nH_out = floor((224 + 2*1 - 3) / 2) + 1 = floor(223/2) + 1 = 111 + 1 = 112\nW_out = 112 (same calculation)\n\n**Output shape: 112 x 112 x 64**\n\nParameter count for this layer:\n(3 x 3 x 3 input_channels + 1 bias) x 64 filters = (27 + 1) x 64 = 1,792 parameters`,
    rubric: ["Correct formula: floor((H + 2P - K) / S) + 1", "Correct output: 112x112x64", "Explains what kernel dot product computes", "Explains stride and padding effects", "Parameter count correct"],
    tags: ["convolution", "kernels", "stride", "padding", "output-dimensions"],
    commonMistakes: ["Using ceil instead of floor", "Forgetting the +1 in the formula", "Getting channels wrong (input channels * filters in param count)", "Off-by-one in output size: 112, not 113 or 111"]
  },
  {
    id: "dl-q18", courseId: "deep-learning", topicId: "dl-cnn",
    title: "Receptive Field Calculation",
    difficulty: "Medium", company: "Waymo", type: "open-ended", estimatedMinutes: 15,
    prompt: `You're designing a CNN at Waymo to detect objects in autonomous driving scenes. Explain receptive field and calculate the effective receptive field for this 4-layer network: Conv(3x3,s=1) -> Conv(3x3,s=2) -> Conv(3x3,s=1) -> Conv(3x3,s=2). Then explain why receptive field matters for object detection.`,
    hints: ["Receptive field grows with depth: RF_l = RF_{l-1} + (K-1) * stride_product_of_previous_layers", "Stride multiplies the effective jump in original image space", "Objects must fit within the receptive field to be detected"],
    modelAnswer: `## Receptive Field Calculation\n\n**What is receptive field?**\nThe receptive field of a neuron is the region of the input image that influences its output. Deeper neurons see larger regions. For detection, the receptive field must be large enough to contain the object of interest.\n\n**Calculation method:**\nRF accumulates as we go deeper. Each convolution adds (K-1) in input space, scaled by the product of all previous strides.\n\nLayer-by-layer (K=3 for all layers):\n\n| Layer | Kernel | Stride | Stride Product | RF Added | Cumulative RF |\n|-------|--------|--------|----------------|----------|---------------|\n| Input |  —     |  —     |  1             |  0       |  1            |\n| Conv1 |  3x3   |  1     |  1             | (3-1)*1=2| 1+2=3         |\n| Conv2 |  3x3   |  2     |  2             | (3-1)*2=4| 3+4=7         |\n| Conv3 |  3x3   |  1     |  4 (1*2*2=4?)  | Hmm... |\n\n**Correct recursive formula:**\nRF_l = RF_{l-1} + (K_l - 1) * ∏(stride_i for i in 1..l-1)\n\n- RF_0 = 1 (single pixel)\n- Conv1 (s=1): RF = 1 + (3-1)*1 = 3\n- Conv2 (s=2): RF = 3 + (3-1)*1 = 5  [previous stride product = 1]\n- Conv3 (s=1): RF = 5 + (3-1)*(1*2) = 5 + 4 = 9\n- Conv4 (s=2): RF = 9 + (3-1)*(1*2*1) = 9 + 4 = 13\n\n**Final receptive field: 13x13 pixels**\n\nNote: The spatial output is downsampled by stride product (1*2*1*2=4), so final feature map represents each position as viewing 13x13 pixels of original image.\n\n**Why this matters for detection:**\n- Small objects (pedestrian at 20x20 pixels): receptive field must cover ~20x20\n- Large vehicles (car at 200x200 pixels): need much larger RF via deeper networks or larger kernels\n- Too small RF: can detect textures/parts but not whole objects\n- Solution: Use dilated convolutions to expand RF without adding strides`,
    rubric: ["Correct recursive formula for receptive field", "Correct intermediate values at each layer", "Final answer 13x13 or demonstrates correct calculation method", "Explains significance for object detection", "Mentions dilated convolutions as RF expansion technique"],
    tags: ["receptive-field", "cnn-architecture", "object-detection"],
    commonMistakes: ["Adding RF naively without accounting for stride", "Confusing spatial output size with receptive field", "Not explaining why large RF matters for detection"]
  },
  {
    id: "dl-q19", courseId: "deep-learning", topicId: "dl-cnn",
    title: "Transfer Learning: Freeze vs Fine-Tune Decision",
    difficulty: "Medium", company: "Amazon", type: "open-ended", estimatedMinutes: 15,
    prompt: `You're building a product defect detection system at Amazon with only 500 labeled images. You plan to use a ResNet-50 pretrained on ImageNet. Explain: (1) why transfer learning works here, (2) how to decide which layers to freeze vs fine-tune, (3) what learning rates to use, and (4) when fine-tuning hurts more than it helps.`,
    hints: ["Early layers detect edges/textures (domain-agnostic), later layers are task-specific", "Use a lower LR for pretrained layers, higher for new head", "With very little data, freeze more layers to prevent catastrophic forgetting"],
    modelAnswer: `## Transfer Learning: Freeze vs Fine-Tune\n\n**Why transfer learning works:**\nConvolutional networks learn a hierarchy of features. Early layers in ImageNet-pretrained models detect universal features: edges, curves, gradients, simple textures. These are domain-agnostic and directly useful for any visual task. Later layers encode high-level ImageNet categories (dogs, cats) which need adaptation for defect detection.\n\n**Decision framework: What to freeze?**\n\n| Data size | Strategy |\n|-----------|----------|\n| < 500 images | Freeze all conv layers, train only new classification head |\n| 500–5000 images | Freeze early layers (conv1-conv3), fine-tune later layers + head |\n| > 5000 images | Fine-tune entire network with differential LR |\n\nFor 500 images: Freeze ResNet backbone, train only the final FC layer. Risk of fine-tuning: catastrophic forgetting — the pretrained features are overwritten by the tiny dataset.\n\n**Learning rates:**\n\`\`\`python\nimport torchvision.models as models\nimport torch.optim as optim\n\nmodel = models.resnet50(pretrained=True)\n\n# Freeze backbone\nfor param in model.parameters():\n    param.requires_grad = False\n\n# Replace head for binary classification\nmodel.fc = nn.Linear(2048, 2)\n\n# Train only the head with higher LR\noptimizer = optim.AdamW(model.fc.parameters(), lr=1e-3)\n\n# When fine-tuning: differential LR\n# optimizer = optim.AdamW([\n#     {'params': model.layer4.parameters(), 'lr': 1e-5},\n#     {'params': model.fc.parameters(), 'lr': 1e-3}\n# ])\n\`\`\`\n\n**When fine-tuning hurts:**\n1. Dataset too small (< 200 images) — model memorizes rather than generalizes\n2. Domain gap too large (satellite images from ImageNet-pretrained — use domain-specific pretraining)\n3. Very low LR required but missed — LR that's too high overwrites pretrained weights`,
    rubric: ["Explains domain-agnostic early features", "Gives data-size-dependent freeze strategy", "Differential learning rates mentioned", "Catastrophic forgetting risk explained", "Code example freezes backbone and replaces head"],
    tags: ["transfer-learning", "fine-tuning", "resnet", "freeze-layers"],
    commonMistakes: ["Always fine-tuning everything regardless of dataset size", "Using same LR for pretrained and new layers", "Not mentioning catastrophic forgetting risk"]
  },
  {
    id: "dl-q20", courseId: "deep-learning", topicId: "dl-cnn",
    title: "Implement ResNet Skip Connections",
    difficulty: "Medium", company: "Meta", type: "code", language: "python", estimatedMinutes: 18,
    prompt: `You're implementing a custom residual block at Meta's computer vision team. Implement a ResNet BasicBlock in PyTorch with: two 3x3 convolutions, batch norm, ReLU, and a skip connection that handles the case where input and output channels differ (using a 1x1 projection conv). Explain why skip connections solve the degradation problem.`,
    hints: ["Skip connection: output = F(x) + x where F is the learned residual", "When channels change, use a 1x1 conv to match dimensions", "The gradient of (F(x)+x) w.r.t. x includes a 1 — always non-zero"],
    modelAnswer: `import torch
import torch.nn as nn

class ResidualBlock(nn.Module):
    expansion = 1

    def __init__(self, in_channels, out_channels, stride=1):
        super().__init__()

        # Main path: two 3x3 convolutions
        self.conv1 = nn.Conv2d(
            in_channels, out_channels,
            kernel_size=3, stride=stride, padding=1, bias=False
        )
        self.bn1 = nn.BatchNorm2d(out_channels)
        self.relu = nn.ReLU(inplace=True)

        self.conv2 = nn.Conv2d(
            out_channels, out_channels,
            kernel_size=3, stride=1, padding=1, bias=False
        )
        self.bn2 = nn.BatchNorm2d(out_channels)

        # Skip connection: identity if dimensions match, else 1x1 projection
        self.shortcut = nn.Identity()
        if stride != 1 or in_channels != out_channels:
            self.shortcut = nn.Sequential(
                nn.Conv2d(in_channels, out_channels,
                          kernel_size=1, stride=stride, bias=False),
                nn.BatchNorm2d(out_channels)
            )

    def forward(self, x):
        identity = self.shortcut(x)  # Skip path

        # Main path
        out = self.conv1(x)
        out = self.bn1(out)
        out = self.relu(out)
        out = self.conv2(out)
        out = self.bn2(out)

        # Add skip connection BEFORE final ReLU
        out = out + identity
        out = self.relu(out)
        return out

# Test
block = ResidualBlock(64, 128, stride=2)
x = torch.randn(2, 64, 56, 56)
out = block(x)
print(f"Input: {x.shape}, Output: {out.shape}")  # torch.Size([2, 128, 28, 28])`,
    rubric: ["Two 3x3 convolutions with BN", "1x1 projection when channels differ", "Addition before final ReLU", "shortcut uses Identity when dims match", "Correct forward pass with skip addition"],
    tags: ["resnet", "skip-connections", "residual-block", "pytorch"],
    commonMistakes: ["Adding skip after final ReLU (should be before)", "Not handling dimension mismatch (assumes same channels always)", "Using bias=True with BatchNorm (redundant — BN's beta handles bias)"]
  },
  {
    id: "dl-q21", courseId: "deep-learning", topicId: "dl-cnn",
    title: "Pooling Types and When to Avoid Them",
    difficulty: "Easy", company: "Google", type: "open-ended", estimatedMinutes: 10,
    prompt: `You're consulting with Google's Vision team. Explain the differences between max pooling, average pooling, and global average pooling. When is each appropriate? Is there a modern trend away from pooling, and what replaces it?`,
    hints: ["MaxPool selects the strongest activation in a window", "GAP reduces spatial dimensions to 1x1 for classification heads", "Strided convolutions can replace pooling — learn the downsampling"],
    modelAnswer: `## Pooling Types in CNNs\n\n**Max Pooling:**\n- Selects the maximum activation in each window (2x2, 3x3)\n- Retains the strongest feature detection — good for "was this feature present anywhere?"\n- Discards precise location within the window (some translation invariance)\n- Standard in AlexNet, VGG, early CNNs\n\n**Average Pooling:**\n- Computes the mean of activations in each window\n- Preserves overall activation level — no dramatic feature dominance\n- Better for cases where feature density matters, not just presence\n\n**Global Average Pooling (GAP):**\n- Averages the entire feature map to a single scalar per channel\n- Input (batch x C x H x W) → output (batch x C)\n- Replaces large fully-connected layers, dramatically reducing parameters\n- Used in ResNet, GoogLeNet, EfficientNet before the classification head\n- Acts as a structural regularizer (no FC parameters to overfit)\n\n**Modern trend: replacing pooling with strided convolutions**\nPooling is hand-designed downsampling; strided convolutions *learn* the downsampling:\n\`\`\`python\n# Old: Conv(stride=1) + MaxPool(2x2)\nnn.Conv2d(64, 128, 3, stride=1, padding=1)\nnn.MaxPool2d(2)  # Fixed: takes max, non-learnable\n\n# Modern: single Conv with stride=2\nnn.Conv2d(64, 128, 3, stride=2, padding=1)  # Learned downsampling\n\`\`\`\n\nAll-convolutional networks (Springenberg et al.) and modern architectures (ResNet bottlenecks, EfficientNet) prefer strided convolutions. Vision Transformers replace spatial pooling with patch tokenization entirely.`,
    rubric: ["Correct description of max vs avg vs global avg pooling", "Explains GAP replaces FC layers", "Mentions strided convolutions as modern replacement", "Explains learnable downsampling advantage", "GAP parameter reduction benefit mentioned"],
    tags: ["pooling", "max-pooling", "global-average-pooling", "strided-convolution"],
    commonMistakes: ["Confusing max and average pooling effects", "Not mentioning GAP's role in modern classification heads", "Not knowing about strided conv replacing pooling"]
  },
  {
    id: "dl-q22", courseId: "deep-learning", topicId: "dl-cnn",
    title: "YOLO vs Faster R-CNN Tradeoffs",
    difficulty: "Hard", company: "Waymo", type: "open-ended", estimatedMinutes: 20,
    prompt: `You're designing the perception system for Waymo's self-driving cars. The team is debating between YOLO (single-stage detector) and Faster R-CNN (two-stage detector). Explain the architectural differences, speed vs accuracy tradeoffs, and which you'd recommend for a safety-critical real-time system.`,
    hints: ["YOLO does detection in one forward pass; Faster R-CNN has a region proposal stage", "Faster R-CNN is more accurate but slower (2-stage)", "In real-time safety systems, latency must be bounded"],
    modelAnswer: `## YOLO vs Faster R-CNN for Autonomous Driving\n\n**Architectural differences:**\n\n**Faster R-CNN (Two-stage):**\n1. Stage 1: Region Proposal Network (RPN) proposes ~2000 region candidates from shared backbone features\n2. Stage 2: ROI Pooling + classifier refines each proposal and predicts class + bounding box\n- Accurate for small objects and overlapping detections\n- Each image passes through the network ~2000 times (once per proposal)\n\n**YOLO (Single-stage):**\n- Divides image into SxS grid; each cell predicts B boxes with confidence and class probabilities\n- Single forward pass: image → (S x S x (5B + C)) prediction tensor\n- YOLOv8/YOLOv10 use anchor-free detection heads\n- Faster but historically less accurate for small/overlapping objects\n\n**Speed vs Accuracy:**\n\n| Model | mAP (COCO) | FPS (GPU) | Latency |\n|-------|-----------|-----------|--------|\n| Faster R-CNN (ResNet-50) | 37.4 | ~5 fps | ~200ms |\n| YOLOv8-L | 52.9 | ~80 fps | ~12ms |\n| YOLOv10-X | 54.4 | ~60 fps | ~16ms |\n\n**Recommendation for Waymo (safety-critical, real-time):**\n\nUse a **multi-stage ensemble approach**:\n1. **Primary detector: YOLOv8/v10** running at 30+ fps for real-time control signals\n2. **Verification layer**: Faster R-CNN or DETR running at lower frequency to catch missed detections\n3. **Sensor fusion**: Combine with LiDAR point cloud detection — camera alone is insufficient for safety-critical AV\n\nPure speed argues for YOLO, but safety argues for ensemble + sensor fusion. Waymo's actual system uses custom LiDAR-camera fusion networks, not off-the-shelf detectors.`,
    rubric: ["Correctly explains 2-stage vs 1-stage architecture", "Correct speed/accuracy tradeoff", "Mentions ROI Pooling in Faster R-CNN", "Addresses safety implications", "Recommends sensor fusion for AV context"],
    tags: ["object-detection", "yolo", "faster-rcnn", "two-stage", "autonomous-driving"],
    commonMistakes: ["Claiming YOLO is always less accurate (YOLOv8+ matches or exceeds Faster R-CNN)", "Not addressing latency requirements for safety-critical systems", "Ignoring sensor fusion for AV"]
  },
  {
    id: "dl-q23", courseId: "deep-learning", topicId: "dl-cnn",
    title: "Class Activation Maps for Interpretability",
    difficulty: "Hard", company: "Google", type: "code", language: "python", estimatedMinutes: 20,
    prompt: `You're presenting model interpretability to Google's trust & safety team. Implement Gradient-weighted Class Activation Mapping (Grad-CAM) for a pretrained ResNet-50. Show how to visualize which image regions the model focuses on when classifying an image.`,
    hints: ["Grad-CAM hooks into the last convolutional layer's activations and gradients", "Weights = global average pooling of gradients", "Weighted sum of activations, then ReLU, then upsample to input size"],
    modelAnswer: `import torch
import torch.nn as nn
import torchvision.models as models
import torchvision.transforms as T
import numpy as np
from PIL import Image
import cv2

class GradCAM:
    def __init__(self, model, target_layer):
        self.model = model
        self.target_layer = target_layer
        self.gradients = None
        self.activations = None
        self._register_hooks()

    def _register_hooks(self):
        def forward_hook(module, input, output):
            self.activations = output.detach()

        def backward_hook(module, grad_input, grad_output):
            self.gradients = grad_output[0].detach()

        self.target_layer.register_forward_hook(forward_hook)
        self.target_layer.register_full_backward_hook(backward_hook)

    def generate(self, input_tensor, class_idx=None):
        self.model.eval()
        output = self.model(input_tensor)

        if class_idx is None:
            class_idx = output.argmax(dim=1).item()

        # Backprop for the target class only
        self.model.zero_grad()
        score = output[0, class_idx]
        score.backward()

        # Grad-CAM weights: global average of gradients
        weights = self.gradients.mean(dim=(2, 3), keepdim=True)  # (1, C, 1, 1)

        # Weighted combination of activation maps
        cam = (weights * self.activations).sum(dim=1, keepdim=True)  # (1, 1, H, W)
        cam = torch.relu(cam)  # Only positive contributions

        # Normalize and upsample to input size
        cam = cam.squeeze().numpy()
        cam = cv2.resize(cam, (input_tensor.shape[3], input_tensor.shape[2]))
        cam = (cam - cam.min()) / (cam.max() - cam.min() + 1e-8)
        return cam, class_idx

# Usage
model = models.resnet50(pretrained=True)
target_layer = model.layer4[-1].conv2  # Last conv in layer4

grad_cam = GradCAM(model, target_layer)

transform = T.Compose([
    T.Resize((224, 224)),
    T.ToTensor(),
    T.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

# img = Image.open("cat.jpg")
# x = transform(img).unsqueeze(0)
# cam, pred_class = grad_cam.generate(x)
# Overlay cam on original image with colormap`,
    rubric: ["Forward hook captures activations", "Backward hook captures gradients", "Weights = global average of gradients (mean dim=2,3)", "Weighted sum + ReLU for CAM", "Normalize and upsample to input size"],
    tags: ["grad-cam", "interpretability", "cnn", "hooks", "visualization"],
    commonMistakes: ["Averaging gradients per channel BEFORE weighting activations (correct order matters)", "Forgetting ReLU (negative regions are often noise)", "Using register_backward_hook (deprecated) vs register_full_backward_hook"]
  },
  {
    id: "dl-q24", courseId: "deep-learning", topicId: "dl-cnn",
    title: "EfficientNet Compound Scaling",
    difficulty: "Medium", company: "Google", type: "open-ended", estimatedMinutes: 12,
    prompt: `You're selecting a model architecture for a mobile product at Google. Explain EfficientNet's compound scaling approach: what three dimensions it scales, the compound coefficient \u03c6, why balanced scaling outperforms naive scaling of just one dimension, and when you'd choose EfficientNet-B0 vs EfficientNet-B7.`,
    hints: ["Three dimensions: depth (more layers), width (more channels), resolution (larger input)", "Compound scaling: depth *= \u03b1^\u03c6, width *= \u03b2^\u03c6, resolution *= \u03b3^\u03c6", "Subject to constraint: \u03b1*\u03b2\u00b2*\u03b3\u00b2 \u2248 2 (controls FLOPS scaling)"],
    modelAnswer: `## EfficientNet Compound Scaling\n\n**The three dimensions:**\n1. **Depth (d):** Number of layers — deeper networks capture more complex features\n2. **Width (w):** Number of channels per layer — wider networks capture more features per level\n3. **Resolution (r):** Input image size — higher resolution provides more fine-grained information\n\n**The compound scaling approach:**\nTraditional scaling changes only one dimension: make the network deeper OR wider OR use higher resolution. EfficientNet scales all three simultaneously using a compound coefficient \u03c6:\n\n- depth: d = \u03b1^\u03c6\n- width: w = \u03b2^\u03c6\n- resolution: r = \u03b3^\u03c6\n\nSubject to: \u03b1 * \u03b2\u00b2 * \u03b3\u00b2 \u2248 2 (ensures FLOPS scale by ~2^\u03c6)\n\nThe base \u03b1, \u03b2, \u03b3 values are found by neural architecture search on a small baseline model (EfficientNet-B0).\n\n**Why balanced scaling outperforms single-dimension scaling:**\nIncreasing only depth beyond a point causes vanishing gradients. Increasing only width fails to capture long-range features. Increasing only resolution helps but you lose feature richness from narrow/shallow networks. Balanced scaling ensures all three dimensions contribute proportionally to accuracy gains per FLOP.\n\n**EfficientNet-B0 vs B7:**\n\n| Model | Input | Params | Top-1 (ImageNet) | Use case |\n|-------|-------|--------|-----------------|----------|\n| B0 | 224x224 | 5.3M | 77.1% | Mobile/edge, real-time inference |\n| B1 | 240x240 | 7.8M | 79.1% | Mobile with more budget |\n| B4 | 380x380 | 19M | 83.0% | Server, moderate accuracy |\n| B7 | 600x600 | 66M | 84.4% | Max accuracy, offline inference |\n\nChoose B0 for mobile products (< 5M params, runs on NPU). Choose B4–B7 when accuracy is critical and inference is server-side.`,
    rubric: ["Names all three scaling dimensions", "Correct compound coefficient formula", "Explains FLOPS constraint \u03b1*\u03b2\u00b2*\u03b3\u00b2 \u2248 2", "Explains why balanced > single dimension", "Gives practical B0 vs B7 guidance"],
    tags: ["efficientnet", "compound-scaling", "neural-architecture", "cnn"],
    commonMistakes: ["Getting the constraint formula wrong", "Not explaining why balanced scaling works", "Saying EfficientNet is always better (larger transformers now dominate)"]
  },

  // ═══ DL SEQUENCE MODELS (8 questions) ═══

  {
    id: "dl-q25", courseId: "deep-learning", topicId: "dl-sequence",
    title: "Why Vanilla RNNs Fail Long Sequences",
    difficulty: "Easy", company: "Apple", type: "open-ended", estimatedMinutes: 10,
    prompt: `You're presenting to Apple's Siri team. Explain exactly why vanilla RNNs struggle with sequences longer than ~20 timesteps, the mathematical root cause, and why LSTMs/GRUs solve this problem.`,
    hints: ["Gradient = product of weight matrices across all timesteps", "If |W| < 1 repeated multiplication vanishes; if |W| > 1 it explodes", "LSTM gates control gradient flow explicitly with additive cell state"],
    modelAnswer: `## Why Vanilla RNNs Fail Long Sequences\n\n**Mathematical root cause:**\n\nIn a vanilla RNN, the hidden state update is: h_t = tanh(W_h * h_{t-1} + W_x * x_t)\n\nDuring backpropagation through time (BPTT), the gradient at timestep t with respect to parameters at timestep k (k << t) requires the chain rule across (t-k) timestep steps:\n\n\u2202L/\u2202h_k = \u2202L/\u2202h_t * \u220f_{i=k}^{t-1} \u2202h_{i+1}/\u2202h_i\n\nEach \u2202h_{i+1}/\u2202h_i = diag(tanh')* W_h\n\nFor long sequences (t-k = 100 steps):\n- If ||W_h|| < 1: product of 100 matrices → gradient → 0 (**vanishing**)\n- If ||W_h|| > 1: product of 100 matrices → gradient → \u221e (**exploding**)\n\nThe tanh activations saturate (squash gradients to near-zero) for large inputs, making vanishing the dominant problem in practice.\n\n**Practical effect:** The network cannot learn dependencies longer than 10-20 timesteps. A sentence like "The cat that sat on the mat was hungry" — the RNN forgets "cat" by the time it needs to predict the verb.\n\n**How LSTM solves this:**\nLSTM introduces a cell state c_t that travels through time with mostly additive updates:\nc_t = f_t * c_{t-1} + i_t * g_t\n\nThe gradient through the cell state is:\n\u2202c_t/\u2202c_{t-1} = f_t (the forget gate)\n\nWhen f_t ≈ 1 (remember), the gradient flows unchanged across many timesteps — no repeated matrix multiplication. The additive update prevents repeated squashing, enabling gradients to propagate hundreds of steps.`,
    rubric: ["Shows the gradient product formula", "Explains vanishing from ||W||<1", "Explains exploding from ||W||>1", "Links tanh saturation to vanishing dominance", "Explains LSTM cell state additive update", "Explains forget gate gradient = f_t"],
    tags: ["rnn", "vanishing-gradients", "lstm", "bptt", "long-sequences"],
    commonMistakes: ["Saying RNNs have 'memory problems' without explaining the gradient math", "Not differentiating vanishing vs exploding", "Not explaining LSTM's additive cell state as the fix"]
  },
  {
    id: "dl-q26", courseId: "deep-learning", topicId: "dl-sequence",
    title: "LSTM Gates Explained Intuitively",
    difficulty: "Medium", company: "Apple", type: "open-ended", estimatedMinutes: 15,
    prompt: `You're explaining LSTMs to a new ML engineer at Apple. Walk through the three LSTM gates (forget, input, output) with an intuitive explanation of what each does and the mathematical equations. Use a concrete example of processing a sentence.`,
    hints: ["Forget gate: what to delete from cell state", "Input gate: what new information to add", "Output gate: what to expose as the hidden state"],
    modelAnswer: `## LSTM Gates Explained\n\n**Core idea:** LSTM maintains two states: cell state c_t (long-term memory) and hidden state h_t (working memory). Three gates control information flow using sigmoid outputs in [0,1].\n\n**Equations:**\nf_t = \u03c3(W_f * [h_{t-1}, x_t] + b_f)  ← Forget gate\ni_t = \u03c3(W_i * [h_{t-1}, x_t] + b_i)  ← Input gate\ng_t = tanh(W_g * [h_{t-1}, x_t] + b_g) ← Candidate values\no_t = \u03c3(W_o * [h_{t-1}, x_t] + b_o)  ← Output gate\n\nc_t = f_t \u2299 c_{t-1} + i_t \u2299 g_t        ← Cell state update\nh_t = o_t \u2299 tanh(c_t)                  ← Hidden state\n\n**Concrete example: "The chef who was tired made dinner"**\n\n**Forget gate (f_t):** "What should I erase?"\n- When processing "who," the LSTM might forget subject gender if irrelevant\n- f_t ≈ 0: completely erase the cell state value\n- f_t ≈ 1: keep everything\n- After "tired" is processed, the network may partially forget the tiredness detail\n\n**Input gate (i_t) + Candidate (g_t):** "What new information should I store?"\n- When processing "chef," i_t is high and g_t encodes [subject=chef, gender=?]\n- The cell state stores "the subject of the sentence is chef"\n- When processing "tired," the cell state gets updated with the chef's state\n\n**Output gate (o_t):** "What should I expose right now?"\n- When predicting the verb after "made," the output gate exposes the stored subject (chef) so the network knows to predict a singular verb\n- o_t controls which parts of the cell state become the hidden state h_t\n\n**Key insight:** The cell state is like a conveyor belt — gates add or remove information as needed, but the information can travel unchanged for many steps, solving the vanishing gradient problem.`,
    rubric: ["All four equations correct (f, i, g, o)", "Cell state update equation correct", "Hidden state equation correct", "Intuitive explanation for each gate", "Concrete sentence example with each gate's role"],
    tags: ["lstm", "gates", "forget-gate", "input-gate", "output-gate"],
    commonMistakes: ["Confusing cell state and hidden state", "Missing the candidate g_t from input gate explanation", "Saying LSTM has 'memory' without explaining the mechanism"]
  },
  {
    id: "dl-q27", courseId: "deep-learning", topicId: "dl-sequence",
    title: "GRU vs LSTM Tradeoffs",
    difficulty: "Easy", company: "Amazon", type: "open-ended", estimatedMinutes: 10,
    prompt: `You're choosing between GRU and LSTM for Amazon's product review sentiment analysis task. Compare their architecture, parameter counts, and performance tradeoffs. When would you choose GRU over LSTM?`,
    hints: ["GRU has 2 gates (reset, update) vs LSTM's 3 (forget, input, output)", "GRU merges cell state and hidden state — simpler computation", "GRU is faster to train with fewer parameters; LSTM has more capacity"],
    modelAnswer: `## GRU vs LSTM\n\n**Architectural differences:**\n\n**LSTM:**\n- 4 gates/mechanisms: forget, input, candidate, output\n- Separate cell state (c_t) and hidden state (h_t)\n- Parameters per unit: ~4 * (input_dim + hidden_dim) * hidden_dim\n\n**GRU (Gated Recurrent Unit):**\n- 2 gates: reset gate (r_t) and update gate (z_t)\n- Single state: h_t (merged cell + hidden)\n- Equations:\n  r_t = \u03c3(W_r * [h_{t-1}, x_t])   ← Reset: how much past to forget\n  z_t = \u03c3(W_z * [h_{t-1}, x_t])   ← Update: blend old vs new\n  n_t = tanh(W_n * [r_t \u2299 h_{t-1}, x_t])  ← New state candidate\n  h_t = (1 - z_t) \u2299 h_{t-1} + z_t \u2299 n_t\n- Parameters per unit: ~3 * (input_dim + hidden_dim) * hidden_dim (~25% fewer than LSTM)\n\n**Performance comparison:**\n\n| Aspect | LSTM | GRU |\n|--------|------|-----|\n| Parameters | ~4x | ~3x |\n| Training speed | Slower | Faster |\n| Performance (short seq) | Comparable | Comparable |\n| Performance (very long seq) | Slightly better | Slightly worse |\n| Implementation | More complex | Simpler |\n\n**When to choose GRU:**\n- Smaller dataset: fewer parameters reduces overfitting\n- Real-time inference: lower latency due to simpler computation\n- Sequences up to ~100-200 steps where LSTM advantage is minimal\n- Resource-constrained environments\n\n**When to choose LSTM:**\n- Very long sequences (> 300 steps)\n- Large datasets where model capacity matters\n- Tasks requiring fine-grained memory control\n\n**For Amazon sentiment analysis:** GRU is likely sufficient. Reviews are typically under 200 words, the dataset is large enough to train both, but GRU trains faster. Start with GRU; switch to LSTM if accuracy is suboptimal.`,
    rubric: ["GRU equations shown correctly", "LSTM has 4 mechanisms, GRU has 2", "Parameter count comparison (~25% fewer for GRU)", "Practical recommendation for the sentiment task", "When each is preferred"],
    tags: ["gru", "lstm", "comparison", "sequence-models"],
    commonMistakes: ["Saying GRU always beats LSTM (depends on sequence length)", "Not knowing GRU merges cell and hidden state", "Wrong gate names for GRU (reset and update, not forget and input)"]
  },
  {
    id: "dl-q28", courseId: "deep-learning", topicId: "dl-sequence",
    title: "Sequence-to-Sequence with Attention",
    difficulty: "Hard", company: "Google", type: "open-ended", estimatedMinutes: 20,
    prompt: `You're building a translation system at Google. Explain the seq2seq architecture with Bahdanau attention: (1) the encoder-decoder bottleneck problem it solves, (2) how attention weights are computed, (3) the context vector, and (4) why this was a precursor to Transformers.`,
    hints: ["Fixed-length context vector bottleneck loses information for long sequences", "Attention score: e_ij = score(s_{i-1}, h_j) where s is decoder state, h is encoder hidden", "Context vector c_i = sum_j alpha_ij * h_j is a weighted average of all encoder hidden states"],
    modelAnswer: `## Seq2Seq with Bahdanau Attention\n\n**1. The bottleneck problem:**\nIn vanilla seq2seq, the encoder compresses the entire input sequence into a single fixed-length context vector (the final encoder hidden state). For a 100-word sentence, this single vector must encode ALL information. Performance degrades as sequences grow longer — information is lost.\n\n**2. Bahdanau Attention mechanism:**\n\nAt each decoder timestep i, instead of using a fixed context vector, attention looks at ALL encoder hidden states:\n\n**Step 1: Compute alignment scores**\ne_{ij} = v_a^T * tanh(W_a * s_{i-1} + U_a * h_j)\n\nWhere s_{i-1} is the previous decoder state, h_j is encoder hidden state at position j.\n\n**Step 2: Softmax to get attention weights**\n\u03b1_{ij} = exp(e_{ij}) / \u03a3_k exp(e_{ik})\n\n\u03b1_{ij} represents "how much decoder step i should attend to encoder position j"\n\n**Step 3: Compute context vector**\nc_i = \u03a3_j \u03b1_{ij} * h_j\n\nc_i is a dynamic, weighted average of all encoder hidden states — different for each decoder step.\n\n**3. Decoder uses context vector:**\ns_i = f(s_{i-1}, y_{i-1}, c_i)\ny_i = g(s_i, c_i)  (predict output token)\n\nFor translating "The black cat sat," when generating "noir" (black in French), attention peaks at the encoder position for "black" — the model learns which source word to focus on.\n\n**4. Precursor to Transformers:**\n\nBahdanau attention established:\n- Dynamic context vectors (not fixed bottleneck)\n- The core Q/K/V pattern: query (decoder state), keys and values (encoder states)\n- Soft attention weights as differentiable alignment\n\nThe Transformer replaced the RNN encoder/decoder entirely with multi-head attention, enabling full parallelism. The attention mechanism is the same core idea, generalized.`,
    rubric: ["Explains fixed-length bottleneck problem", "Correct alignment score formula", "Softmax normalization shown", "Context vector as weighted average", "Links to Transformer Q/K/V pattern"],
    tags: ["seq2seq", "attention", "bahdanau", "encoder-decoder", "context-vector"],
    commonMistakes: ["Confusing hard attention (non-differentiable) with soft attention", "Not explaining why context vector varies per decoder step", "Missing the connection to Transformer architecture"]
  },
  {
    id: "dl-q29", courseId: "deep-learning", topicId: "dl-sequence",
    title: "Bidirectional RNNs",
    difficulty: "Easy", company: "Amazon", type: "open-ended", estimatedMinutes: 10,
    prompt: `You're building a named entity recognition (NER) system at Amazon. Explain how bidirectional RNNs work, why they're beneficial for NER, the output representation, and their key limitation compared to unidirectional models.`,
    hints: ["BiRNN runs two RNNs: one left-to-right, one right-to-left", "At position t, concatenate forward and backward hidden states", "Cannot be used for autoregressive generation (requires future context)"],
    modelAnswer: `## Bidirectional RNNs\n\n**How they work:**\nA BiRNN runs two independent RNNs over the same sequence:\n- Forward RNN: processes x_1, x_2, ..., x_T → produces h_t^\u2192 (has context from x_1..x_t)\n- Backward RNN: processes x_T, x_{T-1}, ..., x_1 → produces h_t^\u2190 (has context from x_t..x_T)\n\nAt each position t, concatenate both hidden states:\nh_t = [h_t^\u2192; h_t^\u2190]  (if each is dim d, output is 2d)\n\n\`\`\`python\nimport torch.nn as nn\n\nbirnn = nn.LSTM(\n    input_size=300,\n    hidden_size=256,\n    num_layers=2,\n    batch_first=True,\n    bidirectional=True  # Output will be 512-dim (256*2)\n)\n\`\`\`\n\n**Why BiRNN is beneficial for NER:**\nNamed entity labels often depend on BOTH left and right context. For example:\n- "Apple announced..." — "Apple" is an ORG (because "announced" is a corporate verb)\n- "I ate an apple..." — "apple" is not an entity\n\nThe label at position t requires seeing what comes AFTER. BiRNN provides the full sequence context at every position.\n\n**Output for NER:**\nFor sequence labeling, use the BiRNN output at each timestep:\n\`\`\`python\noutput, _ = birnn(input_embeds)  # (batch, seq_len, 512)\nlogits = nn.Linear(512, num_tags)(output)  # per-token tag scores\n\`\`\`\n\n**Key limitation:**\nBiRNNs require the ENTIRE sequence before computing any output — they cannot generate text autoregressively. They're suitable only for encoding tasks (classification, NER, translation encoder) not for language modeling or text generation, where future tokens are unknown.`,
    rubric: ["Forward and backward RNN described correctly", "Concatenation creates 2d output", "NER example explains why future context matters", "Code shows bidirectional=True", "Limitation for generation stated clearly"],
    tags: ["bidirectional-rnn", "bi-lstm", "ner", "sequence-labeling"],
    commonMistakes: ["Thinking BiRNN can be used for text generation", "Not knowing the output dimension doubles", "Confusing BiRNN's full-context with attention (different mechanism)"]
  },
  {
    id: "dl-q30", courseId: "deep-learning", topicId: "dl-sequence",
    title: "RNN vs CNN vs Transformer for Sequences",
    difficulty: "Medium", company: "Uber", type: "open-ended", estimatedMinutes: 15,
    prompt: `You're an ML lead at Uber routing audio commands from drivers. For sequence modeling tasks, when would you choose RNN/LSTM, 1D CNN, or Transformer? Compare them on: parallelism, long-range dependencies, positional encoding, inference latency, and give a recommendation for streaming audio classification.`,
    hints: ["RNNs process sequentially, CNNs and Transformers parallelize over positions", "Transformers have O(n^2) attention complexity", "For streaming: model must work without full sequence available"],
    modelAnswer: `## RNN vs CNN vs Transformer for Sequence Modeling\n\n| Property | RNN/LSTM | 1D CNN | Transformer |\n|----------|----------|--------|-------------|\n| Training parallelism | Sequential (slow) | Parallel over positions | Fully parallel |\n| Long-range dependencies | Poor (even LSTM limited) | Limited by receptive field | Excellent (full attention) |\n| Positional encoding | Implicit (recurrence) | Implicit (local context) | Explicit (required) |\n| Inference latency | Low (streaming capable) | Low (sliding window) | High (full sequence) |\n| Memory | O(sequence) | O(kernel_size) | O(sequence^2) |\n| Best sequence length | Short-medium (<500) | Short (<200) | Medium-long (<2048) |\n\n**When to use each:**\n\n**RNN/LSTM:**\n- Streaming/online inference (process token-by-token)\n- Low-latency constraint (<10ms)\n- Historical baselines, simpler deployment\n\n**1D CNN:**\n- Short sequences with local patterns (phoneme detection, n-gram features)\n- Very fast inference\n- WaveNet uses dilated 1D CNNs for audio with large receptive fields\n\n**Transformer:**\n- Batch offline processing (full sequence available)\n- Long-range dependencies critical\n- State-of-the-art accuracy when latency allows\n\n**Recommendation for Uber streaming audio classification:**\n\nUse a **streaming-compatible architecture**:\n1. **Feature extraction:** 1D CNN or mel-spectrogram features (fast, local patterns)\n2. **Sequence modeling:** Small LSTM or streaming Transformer with sliding window attention\n3. **Classification head:** Linear layer on aggregated features\n\nFull Transformer is not suitable for streaming because it requires the complete sequence. Conformer (CNN + Transformer hybrid) is the modern choice for streaming ASR.`,
    rubric: ["RNNs sequential vs CNN/Transformer parallel training", "Transformer O(n^2) complexity mentioned", "Long-range dependency comparison", "Streaming constraint addressed", "Practical recommendation given"],
    tags: ["rnn", "cnn", "transformer", "sequence-modeling", "comparison"],
    commonMistakes: ["Saying Transformer always beats RNN (RNN wins for streaming)", "Not mentioning O(n^2) Transformer complexity", "Ignoring latency constraints for real-time audio"]
  },
  {
    id: "dl-q31", courseId: "deep-learning", topicId: "dl-sequence",
    title: "Time Series Forecasting Architecture",
    difficulty: "Hard", company: "Uber", type: "open-ended", estimatedMinutes: 20,
    prompt: `Uber's demand forecasting team asks you to design a deep learning architecture to predict ride demand for the next 24 hours given the past 7 days of hourly data (168 timesteps) plus external features (weather, events, holidays). Walk through your architecture choices, handling of time features, and how you'd evaluate the model.`,
    hints: ["LSTM/GRU for sequential patterns, Transformer for long-range", "Include time embeddings (hour of day, day of week, etc.)", "Evaluation: MAE, MAPE, and quantile loss for prediction intervals"],
    modelAnswer: `## Uber Demand Forecasting Architecture\n\n**Input features:**\n- Historical demand: 168 hourly values (7 days)\n- Time features: hour_of_day (0-23), day_of_week (0-6), is_holiday, month\n- Exogenous features: temperature, precipitation, major events indicator\n\n**Architecture: Temporal Fusion Transformer (TFT)-inspired**\n\n\`\`\`\n[Historical demand (168,1)] ──────────────────┐\n[Time features (168,4)] → Embedding → ─┐      ├→ LSTM Encoder → Attention → FC → [Forecast (24,)]\n[Exogenous (168,3)] ─────────────────────┘      │\n[Known future features (24,4)] ─────────────────┘\n\`\`\`\n\n**Component design:**\n\n**1. Input embedding:**\n- Cyclical encoding for temporal features: sin(2\u03c0*h/24), cos(2\u03c0*h/24) for hour\n- This encodes periodicity (hour 0 and hour 23 are adjacent)\n\n**2. Sequence encoder:**\n- Bidirectional LSTM (168 → 256-dim) to capture demand patterns\n- Or: Temporal Convolutional Network for faster training\n\n**3. Temporal attention:**\n- Multi-head attention over encoder outputs to identify which past timesteps matter most\n- Provides interpretability (which past hours predict future demand)\n\n**4. Output head:**\n- Multi-step direct: predict all 24 hours at once (avoids error accumulation)\n- 3 quantile heads (p10, p50, p90) for uncertainty bounds\n\n**Training:**\n- Loss: Pinball/quantile loss for p10/p50/p90 simultaneously\n- Or: MAE for point forecast\n\n**Evaluation metrics:**\n- MAE: Mean Absolute Error (interpretable in ride count units)\n- MAPE: Mean Absolute Percentage Error (% error, comparable across zones)\n- WAPE: Weighted APE (robust to near-zero demand periods)\n- Coverage: Does the 80% PI actually cover 80% of actuals?`,
    rubric: ["Cyclical time encoding sin/cos mentioned", "Handles both historical and future known features", "Multi-step direct forecasting (not recursive)", "Quantile outputs for uncertainty", "Appropriate evaluation metrics (MAE, MAPE, coverage)"],
    tags: ["time-series", "forecasting", "lstm", "temporal-attention", "demand-forecasting"],
    commonMistakes: ["Using recursive 1-step forecasting (accumulates errors)", "Ignoring periodicity in time features (treating hour as integer)", "Using only MSE loss (doesn't capture forecast uncertainty)"]
  },
  {
    id: "dl-q32", courseId: "deep-learning", topicId: "dl-sequence",
    title: "Implement a Stacked Bidirectional LSTM",
    difficulty: "Medium", company: "Amazon", type: "code", language: "python", estimatedMinutes: 18,
    prompt: `You're building a text classification model at Amazon for product reviews. Implement a stacked bidirectional LSTM with 2 layers, dropout between layers, and an attention-based pooling mechanism (instead of just using the final hidden state). The model should classify reviews into 5 sentiment classes.`,
    hints: ["nn.LSTM with bidirectional=True, num_layers=2", "Attention pooling: softmax over token scores, then weighted sum of hidden states", "input shape: (batch, seq_len), output: (batch, 5)"],
    modelAnswer: `import torch
import torch.nn as nn
import torch.nn.functional as F

class BiLSTMClassifier(nn.Module):
    def __init__(self, vocab_size, embed_dim=256, hidden_dim=256,
                 num_layers=2, num_classes=5, dropout=0.3):
        super().__init__()
        self.embedding = nn.Embedding(vocab_size, embed_dim, padding_idx=0)

        self.lstm = nn.LSTM(
            input_size=embed_dim,
            hidden_size=hidden_dim,
            num_layers=num_layers,
            batch_first=True,
            bidirectional=True,
            dropout=dropout  # Applied between layers (not after last layer)
        )

        # Attention layer: score each timestep's hidden state
        self.attention = nn.Linear(hidden_dim * 2, 1)

        # Classifier head
        self.dropout = nn.Dropout(dropout)
        self.fc = nn.Linear(hidden_dim * 2, num_classes)

    def forward(self, x, lengths=None):
        # x: (batch, seq_len) — token ids
        embeds = self.embedding(x)  # (batch, seq_len, embed_dim)
        embeds = self.dropout(embeds)

        # Pack padded sequences for efficient LSTM over variable lengths
        if lengths is not None:
            embeds = nn.utils.rnn.pack_padded_sequence(
                embeds, lengths.cpu(), batch_first=True, enforce_sorted=False
            )

        lstm_out, _ = self.lstm(embeds)  # lstm_out: (batch, seq_len, hidden*2)

        if lengths is not None:
            lstm_out, _ = nn.utils.rnn.pad_packed_sequence(
                lstm_out, batch_first=True
            )

        # Attention-based pooling
        # Score each timestep: (batch, seq_len, 1)
        attn_scores = self.attention(lstm_out)
        attn_weights = F.softmax(attn_scores, dim=1)  # (batch, seq_len, 1)

        # Weighted sum of hidden states
        context = (attn_weights * lstm_out).sum(dim=1)  # (batch, hidden*2)

        # Classification
        out = self.dropout(context)
        logits = self.fc(out)  # (batch, num_classes)
        return logits

# Test
model = BiLSTMClassifier(vocab_size=50000)
x = torch.randint(1, 50000, (16, 128))  # batch=16, seq_len=128
print(model(x).shape)  # torch.Size([16, 5])`,
    rubric: ["bidirectional=True, num_layers=2 in LSTM", "Dropout between layers", "Attention scores computed via linear layer", "Softmax over seq_len dimension", "Weighted sum pooling not final hidden state", "Output shape (batch, num_classes)"],
    tags: ["bi-lstm", "stacked-lstm", "attention-pooling", "text-classification", "pytorch"],
    commonMistakes: ["Applying softmax over wrong dimension (should be seq_len, not hidden)", "Using only final hidden state instead of attention pooling", "Not doubling hidden_dim for bidirectional output (it's hidden*2)"]
  },

  // ═══ DL TRANSFORMERS (8 questions) ═══
  {
    id: "dl-q33", courseId: "deep-learning", topicId: "dl-transformers",
    title: "Self-Attention: Q, K, V Explained",
    difficulty: "Medium", company: "Google", type: "open-ended", estimatedMinutes: 12,
    prompt: `You're interviewing at Google Brain. The interviewer asks: "Explain self-attention. What are Query, Key, and Value vectors and how do they interact? Walk me through a concrete example using a sentence like 'The bank by the river was steep'."`,
    hints: ["Think of it like a search engine: query finds relevant keys, values are retrieved", "Attention(Q,K,V) = softmax(QK^T / sqrt(d_k)) * V", "In self-attention, Q, K, V all come from the same sequence"],
    modelAnswer: `**Self-Attention Intuition:**\nSelf-attention lets every token attend to every other token to build context-aware representations.\n\n**Q/K/V roles:**\n- **Query (Q)**: "What am I looking for?" — the current token asking a question\n- **Key (K)**: "What do I contain?" — every token advertising its content\n- **Value (V)**: "What do I give?" — the actual information to retrieve\n\n**Mechanism:** For each token, compute dot product of its Query against all Keys, scale by √d_k (prevents softmax saturation), apply softmax to get attention weights, then weighted-sum the Values.\n\n**Concrete example:** In "The bank by the river was steep", when encoding "bank", its Query attends to Keys of all words. "river" gets high attention weight → its Value is heavily retrieved → "bank" representation shifts toward "riverbank" not "financial bank".\n\n**Why scale by √d_k?** Large d_k makes dot products large, pushing softmax into near-zero-gradient saturation.`,
    rubric: ["Correct Q/K/V intuition (query, key, value roles)", "Correct formula: softmax(QKᵀ/√dk)·V", "Explains why we scale by √dk", "Concrete word disambiguation example", "Notes Q/K/V all derived from same input in self-attention"],
    tags: ["self-attention", "transformers", "Q-K-V", "attention-mechanism"],
    commonMistakes: ["Forgetting the √dk scaling and why it matters", "Confusing self-attention with cross-attention", "Not explaining why dot product measures similarity"]
  },
  {
    id: "dl-q34", courseId: "deep-learning", topicId: "dl-transformers",
    title: "Multi-Head Attention: Why Multiple Heads?",
    difficulty: "Medium", company: "Meta", type: "open-ended", estimatedMinutes: 12,
    prompt: `You're building a language model at Meta. Your lead asks why the original Transformer paper uses 8 attention heads rather than one large attention head with 8x the dimension. What does each head learn, and what do you lose by using just one big head?`,
    hints: ["Each head can specialize in a different type of relationship (syntactic, semantic, positional)", "One big head has the same parameter count but can only attend to one pattern per layer", "Heads run in parallel, so no speed cost"],
    modelAnswer: `**Why Multi-Head:**\nA single attention head produces one weighted combination of values — it can only capture one type of relationship per layer. Multi-head attention runs H attention operations in parallel, each with reduced dimension (d_model/H), then concatenates outputs.\n\n**What different heads learn:**\n- Syntactic dependencies (subject→verb agreement)\n- Coreference (pronoun→noun)\n- Positional proximity (nearby words)\n- Semantic similarity\n\n**Why not one big head?** Same parameter count but single head can only express one attention pattern per layer. Smaller projections force each head into a subspace, preventing one dominant pattern. 8 specialized views > 1 generalist with same capacity.\n\n**Analogy:** Like ensemble models — 8 specialized learners beat 1 generalist with the same total capacity.`,
    rubric: ["Explains each head specializes in different relationship type", "Notes same parameter count as single large head", "Explains projection into subspace forces specialization", "Mentions concatenation of heads", "Heads run in parallel (no speed penalty)"],
    tags: ["multi-head-attention", "transformers", "attention-heads", "architecture"],
    commonMistakes: ["Thinking multi-head attention is slower (it's parallel)", "Claiming heads always learn specific known patterns (they're emergent)", "Confusing number of heads with number of layers"]
  },
  {
    id: "dl-q35", courseId: "deep-learning", topicId: "dl-transformers",
    title: "Positional Encoding: Why Transformers Need It",
    difficulty: "Easy", company: "OpenAI", type: "open-ended", estimatedMinutes: 8,
    prompt: `A junior engineer asks: "Why do transformers need positional encoding? CNNs and RNNs don't need it." Explain the problem and how sinusoidal encoding solves it. What's the difference between absolute and relative positional encoding?`,
    hints: ["Attention is a set operation — permuting tokens gives the same output without positional info", "Sinusoidal: different frequency per dimension, unique vector per position", "Relative PE (RoPE) encodes distance between tokens, not absolute position"],
    modelAnswer: `**The Problem:** Self-attention is permutation-invariant. Shuffling tokens gives the same attention outputs (just shuffled). The model has no idea which word came first.\n\n**Sinusoidal Solution:** Add position-dependent vectors to token embeddings before the transformer. Each dimension uses a different frequency sinusoid → every position gets a unique fingerprint. Generalizes to longer sequences than seen in training.\n\n**Absolute vs Relative PE:**\n- **Absolute** (original BERT/GPT): position 1, 2, 3... get fixed vectors. Simple but struggles beyond training sequence length.\n- **Relative** (RoPE, ALiBi): encodes *distance* between tokens i and j. Captures "these tokens are 3 apart" regardless of absolute position → better length generalization. Used in LLaMA, Gemini.\n\n**Why RNNs don't need it:** Sequential processing inherently encodes order — input at step t depends on step t-1.`,
    rubric: ["Identifies attention is permutation-invariant", "Explains sinusoidal encoding purpose", "Distinguishes absolute vs relative PE", "Relative PE generalizes to longer sequences", "Explains why RNNs don't need positional encoding"],
    tags: ["positional-encoding", "transformers", "RoPE", "architecture"],
    commonMistakes: ["Saying sinusoidal encoding is learned (it's fixed)", "Not knowing why relative PE handles longer sequences better", "Confusing positional encoding with token embedding"]
  },
  {
    id: "dl-q36", courseId: "deep-learning", topicId: "dl-transformers",
    title: "BERT vs GPT: Encoder vs Decoder Architecture",
    difficulty: "Medium", company: "Anthropic", type: "open-ended", estimatedMinutes: 12,
    prompt: `You need to choose an architecture for two tasks: (1) classifying customer support tickets into 50 categories, (2) generating personalized email drafts. Which architecture (BERT-style encoder vs GPT-style decoder) for each and why? What's the fundamental architectural difference?`,
    hints: ["BERT: bidirectional encoder, sees full context both directions, masked LM pretraining", "GPT: autoregressive decoder, causal masking, next-token prediction pretraining", "Encoders are better for understanding, decoders for generation"],
    modelAnswer: `**Fundamental Difference:**\n- **BERT (encoder)**: Bidirectional attention — each token attends to ALL other tokens. Pretrained with masked language modeling. Rich contextual understanding.\n- **GPT (decoder)**: Causal attention — each token only attends to *previous* tokens. Pretrained to predict next token. Natural for generation.\n\n**Task 1 — Ticket Classification → BERT:**\nClassification needs full-message understanding. "not working" — "not" must influence "working" bidirectionally. Add classification head on [CLS] token. Fine-tuning BERT outperforms GPT for discriminative tasks.\n\n**Task 2 — Email Generation → GPT:**\nGeneration requires producing tokens autoregressively. GPT's causal masking matches this exactly. BERT can't generate naturally (needs full sequence for attention).\n\n**Rule of thumb:** Encoder = understanding/classification/extraction. Decoder = generation/completion/dialogue. Encoder-decoder (T5, BART) = both (translation, summarization).`,
    rubric: ["BERT=bidirectional correctly explained", "GPT=causal/autoregressive correctly explained", "Ticket classification → BERT with justification", "Email generation → GPT with justification", "Mentions T5/encoder-decoder as third option"],
    tags: ["BERT", "GPT", "encoder-decoder", "architecture", "fine-tuning"],
    commonMistakes: ["Saying BERT can generate text naturally (it can't)", "Not explaining WHY bidirectional helps classification", "Forgetting encoder-decoder option for seq2seq"]
  },
  {
    id: "dl-q37", courseId: "deep-learning", topicId: "dl-transformers",
    title: "Fine-Tuning vs Training from Scratch Decision",
    difficulty: "Medium", company: "Netflix", type: "open-ended", estimatedMinutes: 12,
    prompt: `Netflix wants a model to detect inappropriate content in user-generated titles and descriptions. You have 50,000 labeled examples. Should you fine-tune pretrained BERT or train a transformer from scratch? What factors drive this decision? What changes with 500 examples vs 5 million?`,
    hints: ["Pretraining on billions of tokens gives general language understanding for free", "Fine-tuning adapts the task head + top layers; fast and data-efficient", "Training from scratch needs orders of magnitude more data"],
    modelAnswer: `**With 50,000 examples → Fine-tune BERT:**\nPretraining on billions of tokens gives BERT rich language understanding. Fine-tuning for 3-5 epochs adapts to your task with a fraction of the data needed from scratch. Strong performance quickly.\n\n**Data size effects:**\n- **500 examples**: Fine-tune with heavy regularization. Freeze most layers, only train classification head + final 1-2 transformer layers. Use data augmentation (synonym replacement, back-translation).\n- **50,000 examples**: Standard fine-tuning. Unfreeze top 4 layers + classification head. Sweet spot.\n- **5 million examples**: Consider domain-adaptive pretraining (continue pretraining on your corpus first) then fine-tune. At 50M+, training from scratch is viable but rarely justified.\n\n**Other factors:**\n- **Inference latency**: BERT may be too slow. Use DistilBERT (66% smaller, 97% performance).\n- **Domain specificity**: If Netflix content language differs greatly from general text, intermediate domain pretraining helps.\n- **Multilingual**: Use mBERT or XLM-RoBERTa for multiple languages.`,
    rubric: ["Recommends fine-tuning for 50k with justification", "Explains layer freezing for 500 examples", "Notes domain-adaptive pretraining at very large scale", "Mentions inference latency / model distillation", "Multilingual consideration"],
    tags: ["fine-tuning", "transfer-learning", "BERT", "data-efficiency"],
    commonMistakes: ["Saying you need millions to fine-tune", "Not considering freezing layers for tiny datasets", "Ignoring inference latency requirements"]
  },
  {
    id: "dl-q38", courseId: "deep-learning", topicId: "dl-transformers",
    title: "Tokenization Trade-offs: BPE vs Word vs Character",
    difficulty: "Easy", company: "Hugging Face", type: "open-ended", estimatedMinutes: 8,
    prompt: `You're building a multilingual NLP model. A teammate asks: "Why BPE tokenization instead of word-level or character-level? What's the vocabulary size trade-off?" Explain all three and when you'd choose each.`,
    hints: ["Word-level: huge vocab, OOV problem for rare words and misspellings", "Character-level: tiny vocab, very long sequences, expensive attention", "BPE merges frequent character pairs iteratively to find subword units"],
    modelAnswer: `**Word-level:** Each word = one token. Problem: vocabulary can be 500k+; rare words, typos, and domain terms are OOV. No morphological sharing ("run", "running", "runner" are unrelated tokens). Obsolete in modern LLMs.\n\n**Character-level:** Each character = one token (~100 token vocab). No OOV ever. Problem: sequences become 5x longer, making attention (O(n²)) very expensive. Model must compose characters into meaning from scratch.\n\n**BPE (Byte-Pair Encoding):** Start with characters. Iteratively merge the most frequent adjacent pair into a new token until vocab size reached (e.g., 50k). Common words → single token. Rare words → meaningful subwords ("unhappiness" → "un" + "happiness"). No OOV (worst case: character fallback).\n\n**When to use each:**\n- BPE/WordPiece: default for modern LLMs (GPT, BERT, LLaMA)\n- SentencePiece: multilingual models (language-agnostic BPE)\n- Character-level: tasks requiring character manipulation (spelling, captcha solving)\n- Word-level: legacy systems only`,
    rubric: ["Explains OOV problem with word-level", "Explains sequence length problem with character-level", "Correct BPE algorithm (iterative pair merging)", "Notes no OOV with BPE", "Multilingual: SentencePiece mentioned"],
    tags: ["tokenization", "BPE", "vocabulary", "NLP", "subword"],
    commonMistakes: ["Confusing vocabulary size with embedding dimension", "Not knowing BPE builds bottom-up from characters", "Forgetting longer sequences hurt quadratic attention"]
  },
  {
    id: "dl-q39", courseId: "deep-learning", topicId: "dl-transformers",
    title: "Vision Transformer vs CNN: Data Efficiency Trade-off",
    difficulty: "Hard", company: "Google", type: "open-ended", estimatedMinutes: 18,
    prompt: `Your team is building an X-ray image classifier for a medical imaging product. You have 10,000 labeled images. Choose between ResNet-50 and ViT-Base. Walk through the trade-offs and make a recommendation. How does your answer change with 1 million images?`,
    hints: ["ViT needs large datasets — it must learn spatial inductive biases CNNs have built-in", "CNNs have translation equivariance and locality hardcoded — efficient on small data", "ViT scales better with more data and compute"],
    modelAnswer: `**Fundamental Difference:**\nCNNs have **inductive biases** hardcoded: locality (nearby pixels relate) and translation equivariance (object position doesn't change its identity). Weight sharing makes them data-efficient.\n\nViTs treat images as sequences of patches and apply self-attention across all patches. No inductive biases — must learn spatial structure from data. Requires much more data to match CNNs.\n\n**With 10,000 images → ResNet-50 (fine-tuned from ImageNet):**\nViT-Base (~86M params) overfits severely on 10k images without heavy augmentation. ResNet-50 pretrained on ImageNet + fine-tuning significantly outperforms. Alternatively: DeiT (ViT variant with knowledge distillation for small data).\n\n**With 1 million images → ViT becomes competitive:**\nViT matches or beats CNNs at ~14M+ images (original ViT paper). At scale, ViT scales better to very large models. Pretrained ViTs (MAE, CLIP) are strong baselines.\n\n**Medical imaging nuance:** Local features (lesion edges, densities) align with CNN inductive biases. Medical-specific pretrained models (BioViL, MedSAM) often outperform both generic choices.\n\n**Recommendation:** ResNet-50 fine-tuned from ImageNet for 10k images.`,
    rubric: ["Identifies CNN inductive biases (locality, translation equivariance)", "Explains ViT's data hunger due to lack of inductive biases", "ResNet for 10k, ViT viable at 1M+ with justification", "Mentions ImageNet pretraining advantage", "Medical domain/specialized pretraining consideration"],
    tags: ["ViT", "CNN", "ResNet", "transfer-learning", "data-efficiency", "medical-imaging"],
    commonMistakes: ["Thinking ViT always outperforms CNN regardless of dataset size", "Not considering pretrained ResNet baseline", "Ignoring inference speed (ViT attention is O(n²) over patches)"]
  },
  {
    id: "dl-q40", courseId: "deep-learning", topicId: "dl-transformers",
    title: "Scaling Laws and the Chinchilla Lesson",
    difficulty: "Hard", company: "OpenAI", type: "open-ended", estimatedMinutes: 18,
    prompt: `OpenAI's scaling laws paper and DeepMind's Chinchilla paper reached different conclusions. Your VP asks you to explain: (1) what scaling laws are, (2) what Chinchilla changed, and (3) how this should influence training decisions with a fixed compute budget.`,
    hints: ["Kaplan et al.: loss scales as power law with parameters, data, compute", "Chinchilla: original GPT-3 was undertrained — optimal is ~20 tokens per parameter", "Fixed compute: balance model size AND dataset size equally"],
    modelAnswer: `**1. Scaling Laws (Kaplan et al. 2020):**\nLM loss decreases as smooth power laws with parameters (N), training tokens (D), and compute (C ≈ 6ND). Each scales independently and predictably. Recommendation at the time: given fixed compute, prioritize model size over training tokens.\n\n**2. Chinchilla (Hoffmann et al. 2022) — The Correction:**\nKaplan held compute fixed while varying N, but kept D too small. Chinchilla's finding: **parameters and training tokens should scale equally** for compute-optimal training. Rule: ~20 tokens per parameter.\n\nResult: GPT-3 (175B params, 300B tokens) was severely undertrained. Chinchilla (70B params, 1.4T tokens) outperforms GPT-3 at 2.5x fewer parameters → same quality at much lower inference cost.\n\n**3. Fixed Compute Budget Implications:**\n- Target N_opt ≈ C^0.5 (roughly), with D = 20N tokens\n- Don't over-invest in parameters at expense of data\n- Smaller model + more data = same performance, cheaper to serve\n- Exception (LLaMA approach): train beyond compute-optimal if inference cost matters more than training cost — over-train a smaller model for cheaper deployment`,
    rubric: ["Correctly describes power law scaling", "Chinchilla: equal scaling of params and tokens", "20 tokens per parameter rule of thumb", "GPT-3 was undertrained example", "Fixed compute: balance N and D, consider inference cost"],
    tags: ["scaling-laws", "Chinchilla", "compute-optimal", "LLMs", "pretraining"],
    commonMistakes: ["Thinking bigger model always wins (Chinchilla refuted this)", "Not knowing the 20 tokens/parameter heuristic", "Confusing training compute optimization with inference cost optimization"]
  }
];
