import Asset from './assets';

class Posts {
    public static read(): Promise<string> {
        return Post.read('..funerals_101.md');
    }
}

export default Posts;