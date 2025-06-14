interface ExecutorStrategy {
    void execute();
}

class JobExecutor implements ExecutorStrategy {
    @Override
    public void execute() {
        System.out.println("Executing a job...");
    }
}

class DefaultExecutor implements ExecutorStrategy {
    @Override
    public void execute() {
        System.out.println("Executing a default job...");
    }
}

class Executioner {
    ExecutorStrategy strategy;

    Executioner(ExecutorStrategy strategy) {
        this.strategy = strategy;
    }

    void execute() {
        strategy.execute();
    }
}