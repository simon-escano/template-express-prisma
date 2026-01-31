export class AppError extends Error {
    status: number;

    constructor(message: string, status: number = 500) {
        super(message);
        this.status = status;
        this.name = 'AppError';
    }
}

export class NotFoundError extends AppError {
    constructor(resource: string) {
        super(`${resource} not found`, 404);
        this.name = 'NotFoundError';
    }
}
