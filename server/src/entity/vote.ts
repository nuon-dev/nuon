import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { User } from "./user";
import { Community } from "./community";

@Entity()
export class Vote {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => User, (user) => user.id)
    voteUser: User

    @ManyToOne(() => Community, (community) => community.id)
    firstCommunity: Community;

    @ManyToOne(() => Community, (community) => community.id)
    secondCommunity: Community;

    @ManyToOne(() => Community, (community) => community.id)
    thirdCommunity: Community;

    @Column()
    term: number;

    @CreateDateColumn()
    createdAt: Date;
}