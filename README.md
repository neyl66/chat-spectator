# Twitch chat spectator

This is Javascript application that allows you to spectate over users that join / leave particular Twitch channels.

It is however not available on large channels and data is sent in batch every 30-60 seconds therefore its not real-time accurate.

See live version at: https://chat-spectator.neyl.dev/

## Getting Started

### Prerequisites
You need to have [Node.js](https://nodejs.org/) installed on your machine.

### Installation

Clone the repository:

```bash
git clone https://github.com/neyl66/chat-spectator.git
```

Navigate into the project directory:

```bash
cd chat-spectator
```

Install the dependencies:

```bash
npm install
```

### Usage

#### Development

To start up a local development server, execute this command:

```bash
npm run dev
```

#### Production

To generate the production version, you can run:

```bash
npm run build
```

All files for you to deploy will be located at the `dist` directory.

#### Run production version locally
To check if everything will be ok in production before the deployment, you can run this command after `npm run build`:

```bash
npm run preview
```