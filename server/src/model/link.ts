import { linkDatabase, linkClickDatabase } from "../model/dataSource"
import { Link, LinkType } from "../entity/link"
import { LinkClick } from "../entity/linkClick"

const LinkModel = {
  async getAllLinks(): Promise<Link[]> {
    return linkDatabase.find({
      where: { isActive: true },
      order: {
        displayOrder: "ASC",
      },
    })
  },

  async getLinkById(id: string): Promise<Link | null> {
    return linkDatabase.findOne({
      where: { id },
    })
  },

  async createLink(
    title: string,
    type: LinkType = LinkType.LINK,
    url?: string,
    body?: string,
    displayOrder: number = 0,
  ): Promise<Link> {
    const link = linkDatabase.create({
      title,
      type,
      url,
      body,
      displayOrder,
      isActive: true,
    })
    return linkDatabase.save(link)
  },

  async updateLink(id: string, data: Partial<Link>): Promise<Link | null> {
    await linkDatabase.update(id, data)
    return this.getLinkById(id)
  },

  async deactivateLink(id: string): Promise<void> {
    await linkDatabase.update(id, { isActive: false })
  },

  async recordClick(
    linkId: string,
    userAgent?: string,
    ipAddress?: string,
  ): Promise<LinkClick> {
    const click = linkClickDatabase.create({
      link: { id: linkId },
      userAgent,
      ipAddress,
    })
    return linkClickDatabase.save(click)
  },

  async getClickStats(
    linkId: string,
  ): Promise<{ totalClicks: number; clicks: LinkClick[] }> {
    const clicks = await linkClickDatabase.find({
      where: { link: { id: linkId } },
      order: { clickedAt: "DESC" },
    })
    return {
      totalClicks: clicks.length,
      clicks,
    }
  },

  async updateDisplayOrder(
    orders: Array<{ id: string; displayOrder: number }>,
  ): Promise<void> {
    for (const order of orders) {
      await linkDatabase.update(order.id, { displayOrder: order.displayOrder })
    }
  },
}

export default LinkModel
